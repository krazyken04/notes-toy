$(document).ready(function(){
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

  // Templates
  var inputListItems = $('#inputListItems').clone().html();

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
      console.log('ENTER KEY!');
      // advance to next input

      // Title Inputs
      if($(this).parent().attr('id') === 'noteInput' || $(this).parent().attr('id') === 'listInput'){
        $(this).parent().find('textarea').trigger('focus');
        $(this).parent().find('li input').eq(0).trigger('focus');
      } else if($(this).parent().is('li')){
        // List Item Inputs
        $(this).parents('ul').append(inputListItems);
        $(this).parents('li').next().find('input').trigger('focus');
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
        if(!$(input).val()){
          $(input).parents('li').remove();
        }
      });

      // If there were no text inputs with content, bring one back
      if($('#listInput li').size() === 0){
        $('#listInput ul').append(inputListItems);
      }

      $('#notePromptWrapper').attr('class', 'closed');
    }
  });
});

function save(){

}