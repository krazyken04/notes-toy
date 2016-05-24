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

  // initial render if data exists
  var LockrData = Lockr.get('Zenenotes');
  var LockrIdent = Lockr.get('ZenenotesIdent');

  if(LockrIdent){
    identify(LockrIdent);
    countNotesAndGrow();
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
      var ident = {'email' : email};
      Lockr.set('ZenenotesIdent', ident);
      identify(ident);
    }
  });
}

function identify(ident){
  console.log(ident);

  if(ident.fullContact && ident.fullContact.photos){
    var photo = ident.fullContact.photos[0].url;
    $('#avatar img, #identCounter img').attr('src', photo);
  } else {
    $('#avatar img, #identCounter img').attr('src', 'https://s3.amazonaws.com/dialexa.com/assets/chromecast/welcome/noun_344493.png');
  }

  if(ident.fullContact && ident.fullContact.contactInfo && ident.fullContact.contactInfo.givenName){
    $('#avatarWelcome em').text('Welcome, ' + ident.fullContact.contactInfo.givenName + '.');
  } else {
    $('#avatarWelcome em').text('Welcome to ZeneNotes!');
  }

  $('#identCounter em').text(ident.notesCapacity);

  $('#authSubmit').attr('class', 'grow1').animate({'background-color' : '#f44e2a'}, 2000, function(){
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
}