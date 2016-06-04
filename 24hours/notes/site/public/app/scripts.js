// Templates
var noteTemplate,
    listTemplate;
var currentlyEditing = null;

$(document).ready(function(){
  // Item Template population

  // Block Template Population
  noteTemplate = $('#templateContainer .note').clone().wrap('<p>').parent().html();
  listTemplate = $('#templateContainer .list').clone().wrap('<p>').parent().html();

  // Autoresizing script grabbed from StackOverflow
  // http://stackoverflow.com/questions/454202/creating-a-textarea-with-auto-resize
  // Modified to take a param from jQuery so I can apply it to every textarea

  var observe;
  if (window.attachEvent) {
      observe = function (element, event, handler) {
          element.attachEvent('on'+event, handler);
      };
  }
  else {
      observe = function (element, event, handler) {
          element.addEventListener(event, handler, false);
      };
  }
  function initAutosize (text) {
      function resize () {
          text.style.height = 'auto';
          text.style.height = text.scrollHeight+'px';
      }
      /* 0-timeout to get the already changed text */
      function delayedResize () {
          window.setTimeout(resize, 0);
      }
      observe(text, 'change',  resize);
      observe(text, 'cut',     delayedResize);
      observe(text, 'paste',   delayedResize);
      observe(text, 'drop',    delayedResize);
      observe(text, 'keydown', delayedResize);

      text.focus();
      text.select();
      resize();
  }

  $('textarea').each(function(i, textarea){
    initAutosize(textarea);
  });

  /* Interaction */

  // Open Note
  $('#closedNotePrompt, #noteButton').click(function(event){
    $(this).parents().find('#notePromptWrapper').attr('class', 'open note');
    $('#noteInput #noteTitle').trigger('focus');
  });

  // Open List
  $('#listButton').click(function(){
    event.stopPropagation();
    $(this).parents().find('#notePromptWrapper').attr('class', 'open list');
    $('#listInput #listTitle').trigger('focus');
  });

  // Bind up delete buttons
  $(document).on('click', 'li i.fa-times', function(e){
    e.stopPropagation();
    if($(this).parents('ul').find('li').size() <= 1){
      $(this).parents('ul').append(inputListItems);
      $(this).parents('ul').find('li:last-child input').trigger('focus');
    } else if($(this).parents('li').next().size() > 0) {
      $(this).parents('li').next().find('input').trigger('focus');
    } else if($(this).parents('li').prev().size() > 0){
      $(this).parents('li').prev().find('input').trigger('focus');
    }
    $(this).parents('li').remove();
  });

  // Bind up Add Buttons
  $(document).on('click', 'li i.fa-plus', function(e){
    e.stopPropagation();
    $(this).parents('ul').append(inputListItems);
    $(this).parents('ul').find('li:last-child input').trigger('focus');
  });

  // Bind up future enter keys and handle list item duplication
  $(document).on('keypress', 'input, textarea', function(e){
    var key = e.which;
    if(key == 13){
      // Title Inputs
      if($(this).parent().attr('id') === 'noteInput' || $(this).parent().attr('id') === 'listInput'){
        $(this).parent().find('textarea').trigger('focus');
        $(this).parent().find('li input').eq(0).trigger('focus');
      } else if($(this).parents('li').size() > 0){
        console.log('IN A LIST PRESSING ENTER!')
        // List Item Inputs
        $(this).parents('ul').append($('#inputListItems').clone().html());
        $(this).parents('ul').find('li:last-child input').trigger('focus');
      }
    }
  });

  // Bind up focus
  $(document).on('focus', 'li input', function(){
    $(this).parents('ul').find('.focused').removeClass('focused');
    $(this).parent().addClass('focused');
  });

  // Bind Click off
  $(document).click(function(event){
    // Clear Empty List Nodes
    if($('#notePromptWrapper').hasClass('open') && $(event.target).parents('#notePromptWrapper').size() === 0){
      // Lists
      $('#listInput').find('li input').each(function(i, input){
        if(!$(input).val() && i != 0){
          $(input).parents('li').remove();
        }
      });

      $('#notePromptWrapper').attr('class', 'closed');
    }
  });

  $('#saveNote').click(function(){
    save(false);
  });

  $('#saveList').click(function(){
    save(true);
  });

  // Editing
  $(document).on('click', '.entry', function(event){
    event.stopPropagation();
    var ID = $(this).attr('id');

    var clickedData = _.find(Lockr.get('Zenenotes').notes, function(note){
      if(note.id === ID){
        console.log('DATA: ', note);
        return true;
      }
    });

    editNote(clickedData);
  });

  $('#authSubmit').click(function(){
    var email = $('#email').val();

    if(email.length > 0){
      getIdent(email);
    } else {
      console.log('Ident Error');
      // identError();
    }
  });

  $('#nothanks').click(hideOverlay);
  $('#takeMeBack').click(takeMeBack);

  $('#resume').click(function(){
    var last = Lockr.get('ZenenotesIdent').lastStoryShared;
    var lastTimer = moment(last).add(20, 'minutes');
    var timeLeft = lastTimer.diff(moment(), 'minutes');

    if(last && timeLeft <= 0 || !last){
      onContentSelected('story');
    } else {
      console.log(timeLeft);
      prompt1PerDay();
    }
  });

  $('#app').click(function(){
    if(!Lockr.get('ZenenotesIdent').appShared){
      onContentSelected('app');
    }
  });

  $('#rick').click(function(){
    if(!Lockr.get('ZenenotesIdent').rickShared){
      onContentSelected('rick');
    } else {
      prompt1PerDay();
    }
  });

  // initial render if data exists
  var LockrData = Lockr.get('Zenenotes');
  var LockrIdent = Lockr.get('ZenenotesIdent');

  if(LockrIdent){
    identify(LockrIdent);
    countNotesAndGrow();
    wireUpTimers(LockrIdent);
  }

  if(LockrData){
    var sorted = _(LockrData.notes).sortBy(function(item){
      return item.id;
    });
    $.each(sorted, function(i, note){
      renderItems(note, false);
    });

    if(LockrIdent){
      $('#authSubmit').attr('class', 'grow1').animate({'background-color' : '#f44e2a'}, 2000, function(){
        $('#authSubmit').attr('class', 'grow2');
        $('#avatar, #avatarWelcome').removeClass('invisible');
        $('#avatar').animate({'opacity' : '1'}, 3000, function(){
          $('#auth').addClass('takeOff').fadeOut('slow');
        });
      });
    }
  } else {
    Lockr.set('Zenenotes', {'notes' : []});
  }

  // Sharing wireups
  $('#linkedin').click(function(){
    IN.User.authorize(shareLinkedInContent);
  });

  twttr.ready(
    function (twttr) {

      twttr.events.bind(
        'tweet',
        function(){
          if(!$('#twitter').hasClass('done')){
            successfulShare();
          }
          $('#twitter').addClass('done');
        }
      );

    }
  );

  $('#facebook').click(shareFacebookContent);
  $('#identCounter').click(triggerShareOverlay);
});

// Sample JSON Storage
/*
{
  notes: [
    {
      id: NUM
      type: STRING (note / list),
      title: STRING,
      content: STRING
    },

    {
      id: NUM,
      type: STRING,
      title: STRING,
      items: [string, string, string]
    }
  ]
}
*/

function save(list){

  // Can we even save?
  var canSave;
  if(list && countNotesAndGrow(false)){
    $('#listInput ul li').each(function(i, item){
      if($(item).find('input').val().length > 0){
        canSave = true;
      }
    });
  } else if(countNotesAndGrow(false)){
    if($('#noteBody').val().length > 0){
      canSave = true;
    }
  } else if(currentlyEditing) {
    canSave = true;
  } else {
    countNotesAndGrow(true);
  }

  if(!canSave){
    return false;
  }

  // Build JSON
  var entryItem = {};
  if(!currentlyEditing){
    entryItem.id = (new Date).getTime();
  } else {
    entryItem.id = currentlyEditing;
    $('#'+currentlyEditing).remove();
  }

  $('body').trigger('click');

  if(list){
    var title = $('#listInput #listTitle').val();
    var items = [];
    $('#listInput li').each(function(i, item){
      items.push($(item).find('input').val());
    });

    console.log('items found!', items);

    if(title.length > 0){
      entryItem.title = title;
    }

    entryItem.items = items;
    entryItem.type = 'list';
  } else {
    var title = $('#noteInput #noteTitle').val();
    var content = $('#noteBody').val();

    if(title.length > 0){
      entryItem.title = title;
    }

    entryItem.content = content;
  }

  renderItems(entryItem, true);
}

function renderItems(item, newItem){
  if(item){
    if(item.type === 'list'){
      $('#notesWrapper').prepend(listTemplate);
      var $newItem = $('#notesWrapper .entry:first-child');
      $newItem.find('ul').empty();
      $.each(item.items, function(i, itemText){
        var clone = $('#templateContainer .listContainer li:first-child').clone().text(itemText);
        $newItem.find('ul').append(clone);
      });
    } else {
      $('#notesWrapper').prepend(noteTemplate);
      var $newItem = $('#notesWrapper .note:first-child');
      $newItem.find('.noteContents').text(item.content);
    }

    $newItem.attr('id', item.id);

    if(item.title){
      $newItem.find('h2').text(item.title);
    } else {
      $newItem.find('h2').text('');
    }

    // Update Storage only if new item and not on initial render
    if(newItem){
      createJSON();
    }
  }
}

function createJSON(){
  var masterJSON = {
    'notes' : []
  }

  $('#notesWrapper .entry').each(function(i, entry){
    var entryObject = {};
    var id,
        type,
        title;

    var id = $(entry).attr('id');

    if($(entry).find('ul').size() > 0){
      type = 'list';
    } else {
      type = 'note'
    }

    title = $(entry).find('h2').text();

    if(type === 'list'){
      var items = [];
      $(entry).find('li').each(function(i, item){
        items.push($(item).text());
      });
      entryObject.items = items;
    } else {
      var content = $(entry).find('.noteContents').text();
      entryObject.content = content;
    }

    entryObject.id = id;
    entryObject.type = type;
    if(title.length > 0) {
      entryObject.title = title;
    }

    masterJSON.notes.push(entryObject);
  });
  console.log(masterJSON);
  Lockr.set('Zenenotes', masterJSON);

  if(currentlyEditing){
    currentlyEditing = null;
  }

  $('.titleInput').val('');
  $('#noteBody').val('');
  $('#listInput ul').empty();
  $('#listInput ul').append($('#inputListItems').clone().html());
  countNotesAndGrow(false);
}

function editNote(note){
  currentlyEditing = note.id;

  if(note.type === 'list'){
    $('#notePromptWrapper').attr('class', 'open list');
    $('#listTitle').trigger('focus');
    $('#listTitle').val(note.title);
    $.each(note.items, function(i, item){
      console.log('ITEM: ', item);
      if(i === 0){
        $('#listInput ul li:first-child input').val(item);
        $('#listInput ul').append($('#inputListItems').clone().html());
        $('#listInput ul').find('li:last-child input').trigger('focus');
      } else {
        $('#listInput ul li:last-child input').val(item);
        $('#listInput ul').append($('#inputListItems').clone().html());
        $('#listInput ul').find('li:last-child input').trigger('focus');
      }
    });
  } else if(note.type === 'note'){
    $('#notePromptWrapper').attr('class', 'open note');
    $('#noteInput #noteTitle').trigger('focus');
    $('#noteTitle').val(note.title);
    $('#noteBody').val(note.content);
  }
}

var welcomeOpen = false;
function getIdent(email){
  if(welcomeOpen){
    return false;
  }
  // ACTUAL CALL
  $.ajax({
      method: "GET",
      url: "https://api.fullcontact.com/v2/person.json",
      data: { "apiKey": "e9326f3cf7d9ecc0", email: email }
    })

  // WHILE WORKING CALL
  // $.ajax({
  //   method: "GET",
  //   url: 'ken.json'
  // })

  .done(function(resp){
    console.log('ajax resp', resp);
    var ident = {'email' : email, 'fullContact' : resp, 'notesCapacity' : 2};
    Lockr.set('ZenenotesIdent', ident);

    identify(ident);
  })

  .error(function(jqXHR, textStatus, errorThrown){
    console.log(jqXHR.status);

    if(jqXHR.status === 422){
      throwAuthError('That is not a real email address...');
    } else if(jqXHR.status === 404){
      var ident = {'email' : email, 'notesCapacity' : 2};
      Lockr.set('ZenenotesIdent', ident);
      identify(ident);
    }
  });
}

function identify(ident){
  genURLS(ident);
  if(ident.fullContact && ident.fullContact.photos){
    var photo = ident.fullContact.photos[0].url;
    $('#avatar img, #identCounter img').attr('src', photo);
  } else {
    $('#avatar img, #identCounter img').attr('src', 'https://s3.amazonaws.com/dialexa.com/assets/chromecast/welcome/noun_344493.png');
  }

  if(ident.fullContact && ident.fullContact.contactInfo && ident.fullContact.contactInfo.givenName){
    $('#avatarWelcome em').text('Welcome, ' + ident.fullContact.contactInfo.givenName + '.');
    $('#message h1 em').text(ident.fullContact.contactInfo.givenName);
  } else {
    $('#avatarWelcome em').text('Welcome to ZeneNotes!');
    $('#message h1').html('You <strong>studious devil!</strong>');
  }

  $('#identCounter em').text(ident.notesCapacity);

  $('#authSubmit').attr('class', 'grow1').animate({'opacity' : '1'}, 2000, function(){
    $('#authSubmit').attr('class', 'grow2');
    $('#avatar, #avatarWelcome').removeClass('invisible');
    $('#avatar').animate({'opacity' : '1'}, 3000, function(){
      $('#auth').addClass('takeOff').fadeOut('slow');
    });
  });
}

function throwAuthError(string){
  console.log('auth error: ' + string);
}

function countNotesAndGrow(overlayTriggerable){
  var ident = Lockr.get('ZenenotesIdent').notesCapacity;
  var notes = Lockr.get('Zenenotes').notes;
  var notesLeft = ident - notes.length;

  if(isNaN(notesLeft)){
    console.log('NaN!!!', ident, notes);
    notesLeft = 2;
  }

  $('#identCounter em').text(notesLeft);

  // Can we save?
  if(notesLeft <= 0){
    if(overlayTriggerable){
      triggerShareOverlay();
    }

    return false;
  } else {
    return true;
  }
}

function triggerShareOverlay(){
  console.log('trigger growth');
  $('#sharePrompt').addClass('visible')
}

function hideOverlay(){
  $('#sharePrompt').removeClass('visible')
}

var contentSelected = 'story';
function onContentSelected(content){
  contentSelected = content;
  $('#chooseContent').attr('class', 'invisible');
  $('#choosePlatform').attr('class', 'visible');
  formatTwitterLink();
}

function takeMeBack(){
  $('#chooseContent').attr('class', 'visible');
  $('#choosePlatform').attr('class', 'invisible');
  $('.done').removeClass('done');
}

function formatTwitterLink(){
  var tweetText;
  var base64 = referralStringBuilder(Lockr.get('ZenenotesIdent'), contentSelected, 'twitter');

  if(contentSelected === 'story'){
    tweetText = encodeURIComponent('#GrowthEngineer @KenHanson04 Takes a job interview and turns it into a Growth Machine: bit.ly/GrowthMachine');
  } else if(contentSelected === 'app'){
    tweetText =encodeURIComponent('#GrowthEngineer @KenHanson04 builds Note Taking app in 24hrs for a job interview and turns it into a Growth Machine ' + bitlyURLS.twitter.app);
  } else if(contentSelected === 'rick'){
    tweetText = encodeURIComponent('#GrowthEngineer @KenHanson04 grows a startup to 100M users in 14 days! ' + bitlyURLS.twitter.rick);
  }
  var newLink = 'https://twitter.com/intent/tweet?text='+tweetText;
  $('#twitter a').attr('href', newLink);
}

function onLinkedInAuth(){
  IN.Event.on(IN, "auth", shareLinkedInContent);
}

function shareLinkedInContent() {
  var content;
  if(contentSelected === 'story'){
    content = 'Read the Case Study: Growth Engineer takes job interview and turns it into a growth machine. https://medium.com/@kenhanson04/how-i-took-an-engineering-test-turned-it-into-a-growth-machine-6834845bd052'
  } else if(contentSelected === 'app'){
    content = 'A Growth Engineer builds a Note Taking app in 24 hours for an engineering challenge, but turns it into a growth machine. http://www.zenenotes.com'
  } else if(contentSelected === 'rick'){
    content = 'Growth Engineer exposes how he grew a user base to 100M users in 14 days! http://www.zenenotes.com/100M-Users/'
  }

  // Build the JSON payload containing the content to be shared
  var payload = {
    "comment": content,
    "visibility": {
      "code": "anyone"
    }
  };

  IN.API.Raw("/people/~/shares?format=json")
    .method("POST")
    .body(JSON.stringify(payload))
    .result(function(response){
      if(!$('#linkedin').hasClass('done')){
        successfulShare();
      }
      $('#linkedin').addClass('done');
    });
}

function shareFacebookContent(){
  var href,
      quote;

  if(contentSelected === 'story'){
    href = 'https://medium.com/@kenhanson04/how-i-took-an-engineering-test-turned-it-into-a-growth-machine-6834845bd052';
    quote = 'How I turned a Job Interview into a Growth Machine';
  } else if(contentSelected === 'app'){
    href = 'http://www.zenenotes.com';
    quote = 'A growth engineer builds a Note Taking app in 24 hours for an engineering challenge, but turns it into a growth machine.'
  } else if(contentSelected === 'rick'){
    href = 'http://www.zenenotes.com/100M-Users/';
    quote = 'Growth engineer exposes how he grew a user base to 100M users in 14 days!'
  }

  FB.ui({
    method: 'share',
    href: href,
    hashtag: '#GrowthEngineering',
    quote: quote
  }, function(response){
    if(response !== undefined){
      if(!$('#facebook').hasClass('done')){
        successfulShare();
      }
      $('#facebook').addClass('done');
    }
  });
}

function successfulShare(){
  console.log('AWARD POINTS!');



  var ident = Lockr.get('ZenenotesIdent');

  if(contentSelected === 'story'){
    ident.notesCapacity += 10;
    ident.storyShared = true;
    ident.lastStoryShared = new Date();
  } else if(contentSelected === 'app'){
    ident.notesCapacity += 5;
    ident.appShared = true;
    ident.lastAppShared = new Date();
  } else if(contentSelected === 'rick'){
    ident.notesCapacity += 1;
    ident.rickShared = true;
    ident.lastRickShared = new Date();
  }

  Lockr.set('ZenenotesIdent', ident);
  console.log(Lockr.get('ZenenotesIdent'));
  wireUpTimers(Lockr.get('ZenenotesIdent'));
  countNotesAndGrow(false);
}

function prompt1PerDay(){
  console.log(Lockr.get('ZenenotesIdent').lastStoryShared, Lockr.get('ZenenotesIdent').lastAppShared, Lockr.get('ZenenotesIdent').lastRickShared);
  var twentyMinsAfter = moment(Lockr.get('ZenenotesIdent').lastStoryShared).add('20', 'minutes');
  var now = moment();
  console.log(twentyMinsAfter.diff(now,'minutes'));
}

function wireUpTimers(LockrIdent){
  for (var i = 1; i < 100; i++)
        if($('#auth').hasClass('takeOff')){
          window.clearInterval(i);
        }

  if(LockrIdent.lastStoryShared){
    var lastStory = LockrIdent.lastStoryShared;
    var lastStoryTimer = moment(lastStory).add(20, 'minutes');
    var storyTimeLeft = lastStoryTimer.diff(moment(), 'minutes');
    timerFire('#resume', storyTimeLeft*60);
  }

  if(LockrIdent.lastAppShared){
    var lastApp = LockrIdent.lastAppShared;
    var lastAppTimer = moment(lastApp).add(20, 'minutes');
    var appTimeLeft = lastAppTimer.diff(moment(), 'minutes');
    timerFire('#app', appTimeLeft*60);
  }

  if(LockrIdent.lastRickShared){
    var lastRick = LockrIdent.lastRickShared;
    var lastRickTimer = moment(lastRick).add(20, 'minutes');
    var rickTimeLeft = lastRickTimer.diff(moment(), 'minutes');
    timerFire('#rick', rickTimeLeft*60);
  }
}

// http://stackoverflow.com/questions/20618355/the-simplest-possible-javascript-countdown-timer
// window.onload = function () {
//     var fiveMinutes = 60 * 17,
//         display = $('#time');
//     startTimer(fiveMinutes, display);
// };

function startTimer(duration, display) {

    var timer = duration, minutes, seconds;
    window.setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.text(minutes + ":" + seconds);

        if (--timer < 0) {
            display.remove();
        }
    }, 1000);
}

function timerFire(selector, time){
  if($(selector + ' .countdown').size() === 0){
    $(selector).append('<span class="countdown"></span>');
  }

  startTimer(time, $(selector + ' .countdown'));
}

var bitlyURLS = {
  'linkedin' : {
    'app' : null,
    'rick' : null,
  },

  'facebook' : {
    'app' : null,
    'rick' : null,
  },

  'twitter' : {
    'app' : null,
    'rick' : null,
  }
};

function referralStringBuilder(ident, content, platform){
  var json = '{"email":"'+ident.email+'","content":"'+content+'","platform":"'+platform+'"}';
  var base64 = Base64.encode(json);
  return base64;
}

function bitlyLink(fullURL, content, platform, assignee){
  // Check if we've created a link or not:
  var exists;

  $.ajax({
    method: 'GET',
    url: 'https://api-ssl.bitly.com/v3/link/lookup',
    data: {
      access_token: '956b2258ad47e9b4a6790a51fbfb0145241c5fe1',
      url: fullURL
    }
  }).done(function(response){
    if(response.data.link_lookup[0].aggregate_link){
      bitlyURLS[platform][content] = response.data.link_lookup[0].aggregate_link;
      return response.data.link_lookup[0].aggregate_link;
    } else {
      console.log('--== NO URL ==-- AJAXING');
      $.ajax({
        method: 'GET',
        url: 'https://api-ssl.bitly.com/v3/shorten',
        data: {
          "access_token" : '956b2258ad47e9b4a6790a51fbfb0145241c5fe1',
          "longUrl" : fullURL
        }
      }).done(function(response){
        bitlyURLS[platform][content] = response.data.url;
        return response.data.url;
      }).fail(function(response){
        console.log('BITLY LINK GEN ERROR', response)
      });
    }
  });
}

function genURLS(ident){
  bitlyLink('http://www.zenenotes.com/?r=' + referralStringBuilder(ident, 'app', 'linkedin'), 'app', 'linkedin');
  bitlyLink('http://www.zenenotes.com/100M-Users/?r=' + referralStringBuilder(ident, 'rick', 'linkedin'), 'rick', 'linkedin')
  bitlyLink('http://www.zenenotes.com/?r=' + referralStringBuilder(ident, 'app', 'twitter'), 'app', 'twitter')
  bitlyLink('http://www.zenenotes.com/100M-Users/?r=' + referralStringBuilder(ident, 'rick', 'twitter'), 'rick', 'twitter')
  bitlyLink('http://www.zenenotes.com/?r=' + referralStringBuilder(ident, 'app', 'facebook'), 'app', 'facebook')
  bitlyLink('http://www.zenenotes.com/100M-Users/?r=' + referralStringBuilder(ident, 'rick', 'facebook'), 'rick', 'facebook')
}
