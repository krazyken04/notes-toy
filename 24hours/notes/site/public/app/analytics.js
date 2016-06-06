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
  // Banner Clicks
  $('#notification #cta').click(function(){
    mp('Medium CT');
  });

  $('#notification #close').click(function(){
    mp('Medium Dismissed');
  });
});