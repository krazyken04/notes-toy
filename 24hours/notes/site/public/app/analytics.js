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

  // Note Taken Analytics are handled in /app/scripts.js -->

  // Check for Ident, People properties set inside of /app/scripts.js --> identify(ident)
  // If ident is there, use it's contents to enable splitting on every action

  if(Lockr.get('ZenenotesIdent')){
    sl('Ident found');
    var ident = Lockr.get('ZenenotesIdent');
    var email = ident.email;

    // If all data present
    if(ident.fullContact.contactInfo.givenName && referrer){
      sl('Full Data');
      mixpanel.register({
        'Name': ident.fullContact.contactInfo.givenName,
        'Email' : ident.email,
        'Referrer' : referrer,
        'Referral Source' : rSource,
        'Referral Content' : rContent
      });
    } else if(ident.fullContact.contactInfo.givenName) { // Or just name
      sl('Only Name, No Referrer');
      mixpanel.register({
        'Name': ident.fullContact.contactInfo.givenName,
        'Email' : ident.email
      });
    } else if(referrer){ // Or just referrer
      sl('Only Referrer, No Name');
      mixpanel.register({
        'Email' : ident.email,
        'Referrer' : referrer,
        'Referral Source' : rSource,
        'Referral Content' : rContent
      });
    } else { // Or just email
      sl('Just Email, No Name or Referrer');
      mixpanel.register({
        'Email' : ident.email
      });
    }
  }
});