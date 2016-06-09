var referrer,
    rSource,
    rContent;

function sl(message){
  console.log('--== MIXPANEL SANITY LOGGER: ' + message + ' ==--');
}

function mp(string){
  sl('Logging - ' + string);
  mixpanel.track(string);
}

$(document).ready(function(){
  var page = window.location.pathname;
  // Banner Clicks
  $('#notification #cta').click(function(){
    mp('Medium CT');
  });

  $('#notification #close').click(function(){
    mp('Medium Dismissed');
  });

  if(page === '/'){
    $('div.downloads a').click(function(){
      mp('App Clickthrough');
    });

    $('.socialList li a').each(function(i, link){
      var linkClicked = $(link).text().trim();
      $(link).click(function(){
        mp('Social Click ' + linkClicked);
      });
    });
  }
});