var dateSelector;

$(document).ready(function(){
  $(function () {
    $('[data-toggle="tooltip"]').tooltip()
  })

  dateSelector = $('#datePicker').MPDatepicker();
  dateSelector.on('change', function(event, dateRange) {
    // emptyCharts();
    renderCharts();
  });

  renderCharts();
});

function renderCharts(){
  // Highcharts / Mixpanel Data wants:
  // {Series: {time : value, time: value}}

  // ---==== SHARE HEALTH CHART ====---
  MP.api.funnel('Login', 'Content Shared', {
    from: dateSelector.val().from,
    to: dateSelector.val().to,
    length: 14
  }, function(results){
    var conv_ratio = { 'Share Conversion Rate' : null};

    var keysOut = _.pairs(results[1]);
    var CRObjs = {};
    _.each(keysOut, function(day){
      CRObjs[day[0]] = day[1].overall_conv_ratio;
    });

    conv_ratio["Share Conversion Rate"] = CRObjs;

    $('#funnelReport').css({'width' : $('#funnelReport').parent().width() - 12})
    var funnelReportChart = $('#funnelReport').MPChart({chartType: 'line'});
    funnelReportChart.MPChart('setData', conv_ratio);
  });

  // ---==== SNAPSHOTS ====---
  // Avg Shares / User
  var avgSharesJQL = "function main() {"+
    "var total = 0;"+
    "var count = 0;"+
    "return Events({"+
      "from_date: '"+moment(dateSelector.val().from).format('YYYY-MM-DD')+"',"+
      "to_date:   '"+moment(dateSelector.val().to).format('YYYY-MM-DD')+"',"+
      "event_selectors: [{event: 'Content Shared'}]"+
    "})"+
    ".groupBy(['distinct_id'], mixpanel.reducer.count())"+
    ".map(function(item){"+
      "count++;"+
      "total += item.value;"+
    "}).reduce(function(foo, bar){"+
      "if(count > 0){"+
        "return total/count;"+
      "} else {"+
        "return 0;"+
      "}"+
    "});"+
  "}";

  MP.api.jql(avgSharesJQL).done(function(result){
    $('#avgSharesPerUser').text(result[0].toFixed(2) + ' Shares');
  });

  // Total Shares by Content
  var totalSharesByContentJQL = "function main() {"+
    "return Events({"+
      "from_date: '"+moment(dateSelector.val().from).format('YYYY-MM-DD')+"',"+
      "to_date:   '"+moment(dateSelector.val().to).format('YYYY-MM-DD')+"',"+
      "event_selectors: [{'event' : 'Content Shared'}]"+
    "})"+
    ".groupBy(['properties.Content'], mixpanel.reducer.count())"+
    ".map(function(item){"+
      "var obj = {};"+
      "var key = item.key[0];"+
      "obj[key] = item.value;"+
      "return obj"+
    "});"+
  "}";

  MP.api.jql(totalSharesByContentJQL).done(function(result){
    var data = shareHealthDataManipulation(result);
    createChart('#totalSharesByContent', data, 'bar');
  });

  // Total Conversions by Content
  var totalConversionsByContentJQL = "function main() {"+
    "return Events({"+
      "from_date: '"+moment(dateSelector.val().from).format('YYYY-MM-DD')+"',"+
      "to_date:   '"+moment(dateSelector.val().to).format('YYYY-MM-DD')+"',"+
      "event_selectors: [{'event' : 'Conversion'}]"+
    "})"+
    ".groupBy(['properties.Referring Content'], mixpanel.reducer.count())"+
    ".map(function(item){"+
      "var obj = {};"+
      "var key = item.key[0];"+
      "if(item.key[0] === null){"+
        "key = 'Organic';"+
      "}"+
      "obj[key] = item.value;"+
      "return obj"+
    "});"+
  "}";

  MP.api.jql(totalConversionsByContentJQL).done(function(result){
    var data = shareHealthDataManipulation(result);
    createChart('#totalConversionsByContent', data, 'bar');
  });

  // Total Shares by Platform
  var totalSharesByPlatformJQL = "function main() {"+
    "return Events({"+
      "from_date: '"+moment(dateSelector.val().from).format('YYYY-MM-DD')+"',"+
      "to_date:   '"+moment(dateSelector.val().to).format('YYYY-MM-DD')+"',"+
      "event_selectors: [{'event' : 'Content Shared'}]"+
    "})"+
    ".groupBy(['properties.Platform'], mixpanel.reducer.count())"+
    ".map(function(item){"+
      "var obj = {};"+
      "var key = item.key[0];"+
      "obj[key] = item.value;"+
      "return obj"+
    "});"+
  "}";

  MP.api.jql(totalSharesByPlatformJQL).done(function(result){
    var data = shareHealthDataManipulation(result);
    createChart('#totalSharesByPlatform', data, 'bar');
  });

  // Total Conversions by Platform
  var totalConversionsByPlatformJQL = "function main() {"+
    "return Events({"+
      "from_date: '"+moment(dateSelector.val().from).format('YYYY-MM-DD')+"',"+
      "to_date:   '"+moment(dateSelector.val().to).format('YYYY-MM-DD')+"',"+
      "event_selectors: [{'event' : 'Conversion'}]"+
    "})"+
    ".groupBy(['properties.Referring Source'], mixpanel.reducer.count())"+
    ".map(function(item){"+
      "var obj = {};"+
      "var key = item.key[0];"+
      "if(item.key[0] === null){"+
        "key = 'Organic';"+
      "}"+
      "obj[key] = item.value;"+
      "return obj"+
    "});"+
  "}";

  MP.api.jql(totalConversionsByPlatformJQL).done(function(result){
    var data = shareHealthDataManipulation(result);
    createChart('#totalConversionsByPlatform', data, 'bar');
  });
  // ---==== USAGE ====---

  // Logins
  var loginJql = "function main() {" +
      "return Events({"+
        "from_date: '"+moment(dateSelector.val().from).format('YYYY-MM-DD')+"',"+
        "to_date:   '"+moment(dateSelector.val().to).format('YYYY-MM-DD')+"',"+
        "event_selectors: [{'event' : 'Conversion'}, {'event' : 'Login'}]"+
      "}).groupBy(['time'], mixpanel.reducer.count())"+
      ".map(function(ev){"+
        "return {'day' : ev.key[0], 'value' : ev.value}"+
      "});"+
    "}";

  MP.api.jql(loginJql).done(function(results){
    loginsPerDayFormatted = usageDataManipulation(results, 'Logins');
    createChart('#usageLoginsPerDay', loginsPerDayFormatted, 'line');
  });

  // Shares
  var sharesJQL = "function main() {"+
    "return Events({"+
      "from_date: '"+moment(dateSelector.val().from).format('YYYY-MM-DD')+"',"+
      "to_date:   '"+moment(dateSelector.val().to).format('YYYY-MM-DD')+"',"+
      "event_selectors: [{'event' : 'Content Shared'}]"+
    "}).groupBy(['time'], mixpanel.reducer.count())"+
    ".map(function(ev){"+
      "return {'day' : ev.key[0], 'value' : ev.value}"+
    "})"+
    "}";

    MP.api.jql(sharesJQL).done(function(results){
      sharesPerDayFormatted = usageDataManipulation(results, 'Shares');
      createChart('#usageSharesPerDay', sharesPerDayFormatted, 'line');
    });

  // Notes
  var notesJQL = "function main() {"+
    "return Events({"+
      "from_date: '"+moment(dateSelector.val().from).format('YYYY-MM-DD')+"',"+
      "to_date:   '"+moment(dateSelector.val().to).format('YYYY-MM-DD')+"',"+
      "event_selectors: [{'event' : 'Note'}]"+
    "}).groupBy(['properties.type', 'time'], mixpanel.reducer.count())"+
    ".map(function(ev){"+
      "return {'day' : ev.key[1], 'value' : ev.value, 'type' : ev.key[0]}"+
    "});"+
  "}";

  MP.api.jql(notesJQL).done(function(results){
    /* {
        'Notes' : { time : 2, time: 1, },
        'Lists' : { time: 4, time: 1 }
    }*/

    var notesData = {
      'Note' : {},
      'List' : {}
    };

    _.each(results, function(day, i){
      var momentDay = moment(day.day).utcOffset(0).format('M/D h A');

      if(notesData[day.type][momentDay]){
        notesData[day.type][momentDay] += day.value;
      } else {
        notesData[day.type][momentDay] = day.value;
      }
    });

    createChart('#usageNotesPerDay', notesData, 'line');
  });

   // ---==== LEADERBOARD ====---

   // Get Leaders
   var leaderListJQL = "function main() {"+
    "return Events({"+
      "from_date: '"+moment(dateSelector.val().from).format('YYYY-MM-DD')+"',"+
      "to_date:   '"+moment(dateSelector.val().to).format('YYYY-MM-DD')+"',"+
      "event_selectors: [{'event' : 'Conversion'}]"+
    "})"+
    ".groupBy(['properties.Referrer'], mixpanel.reducer.count())"+
    ".map(function(ref){"+
      "if(ref.key[0] === null){"+
        "return {'user' : null, 'value' : 0}"+
      "} else {"+
        "return {'user' : ref.key[0], 'value' : ref.value}"+
      "}"+
    "}).reduce(mixpanel.reducer.top(3));"+
  "}";

  MP.api.jql(leaderListJQL).done(function(results){
    leaderListDOM(results[0]);
    fetchLeaderProfiles(results[0]);
  });
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function usageDataManipulation(results, label){
  var temporaryObject = {};
  temporaryObject[label] = {};

  _.each(results, function(day, i){
    var momentDay = moment(day.day).utcOffset(0).format('M/D h A');
    if(temporaryObject[label][momentDay]){
      temporaryObject[label][momentDay] += day.value;
    } else {
      temporaryObject[label][momentDay] = day.value;
    }
  });
  return temporaryObject;
}

function createChart(selector, data, type){
    $(selector).css({'width' : $(selector).parent().width() - 12})
    if(data.series){
      var chart = $(selector).MPChart({chartType: type, highchartsOptions: {chart: {height: 200}, colors: data.colors}});
      chart.MPChart('setData', data.series);
    } else {
      var chart = $(selector).MPChart({chartType: type, highchartsOptions: {chart: {height: 200}}});
      chart.MPChart('setData', data);
    }
}

function shareHealthDataManipulation(result){
  var formattedData = {};
  var colors = [];
  _.each(result, function(content){
    var key = _.keys(content)[0];
    var value = content[key];

    formattedData[capitalizeFirstLetter(key)] = value;
  });

  var sortedData = _.chain(formattedData).pairs().sortBy(function(data){
    return -data[1];
  }).object().value();

  _.each(_.keys(sortedData), function(key){
    if(key === 'App'){
      colors.push('#53a3eb')
    } else if(key === 'Story'){
      colors.push('#a28ccb')
    } else if(key === 'Rick'){
      colors.push('#32bbbd');
    } else if(key === 'Facebook'){
      colors.push('#3b5998');
    } else if(key === 'Twitter'){
      colors.push('#36b9ff');
    } else if(key === 'Linkedin'){
      colors.push('#006699')
    } else if(key === 'Organic'){
      colors.push('#34a853');
    }
  });

  return {'series' : sortedData, 'colors' : colors};
}

function leaderListDOM(leaderArray){
  _.each(leaderArray, function(leader){
    var str= leader.user;
    var nameMatch = str.match(/^([^@]*)@/);
    var name = nameMatch ? nameMatch[1] : null;

    var card = '<div class="col-sm-12 col-md-4 text-center">'+
      '<div class="leaderCardWrapper" id="'+name+'">'+
      '</div>'+
    '</div>';

    $('#leaderBoard > .row').append(card);
  });
}

function fetchLeaderProfiles(leaderArray){
  console.log('--=== LEADERS ===---', leaderArray);

  _.each(leaderArray, function(leader, i){
    console.log('------ SEARCHING -----', leader.user);
    var lookupJQL = "function main() {"+
      "return People().filter(function(person){"+
        "if(person.properties.$email == '"+leader.user+"'){"+
          "return person;"+
        "}"+
      "}).map(function(user){"+
        "var str= user.properties.$email;"+
        "var nameMatch = str.match(/^([^@]*)@/);"+
        "var name = nameMatch ? nameMatch[1] : null;"+
        "return {'Pic' : user.properties.Pic, 'Name' : user.properties.$first_name, 'EmailUserName' : name}"+
      "})"+
    "}";

    var bestShareConversionsJQL = "function main() {"+
      "return Events({"+
        "from_date: '"+moment(dateSelector.val().from).format('YYYY-MM-DD')+"',"+
        "to_date:   '"+moment(dateSelector.val().to).format('YYYY-MM-DD')+"',"+
        "event_selectors: [{event: 'Conversion'}]"+
      "}).filter(function(ev){"+
        "if(ev.properties['Referrer'] == '"+leader.user+"'){"+
          "return ev;"+
        "}"+
      "}).groupBy(['properties.Referring Content','properties.Referring Source'], mixpanel.reducer.count())"+
      ".reduce(mixpanel.reducer.top(1));"+
    "}";

    var bestShareClickthroughsJQL = "function main() {"+
      "return Events({"+
        "from_date: '"+moment(dateSelector.val().from).format('YYYY-MM-DD')+"',"+
        "to_date:   '"+moment(dateSelector.val().to).format('YYYY-MM-DD')+"',"+
        "event_selectors: [{event: 'Visit'}]"+
      "}).filter(function(ev){"+
        "if(ev.properties['Referrer'] == '"+leader.user+"'){"+
          "return ev;"+
        "}"+
      "}).groupBy(['properties.Referring Content','properties.Referring Source'], mixpanel.reducer.count())"+
      ".reduce(mixpanel.reducer.top(1));"+
    "}";

    var totalClickthroughsJQL = "function main() {"+
      "return Events({"+
      "from_date: '"+moment(dateSelector.val().from).format('YYYY-MM-DD')+"',"+
      "to_date:   '"+moment(dateSelector.val().to).format('YYYY-MM-DD')+"',"+
        "event_selectors: [{event: 'Visit'}]"+
      "}).filter(function(ev){"+
        "if(ev.properties['Referrer'] == '"+leader.user+"'){"+
          "return ev;"+
        "}"+
      "})"+
      ".reduce(mixpanel.reducer.count());"+
    "}";

    var totalConversionsJQL = "function main() {"+
      "return Events({"+
      "from_date: '"+moment(dateSelector.val().from).format('YYYY-MM-DD')+"',"+
      "to_date:   '"+moment(dateSelector.val().to).format('YYYY-MM-DD')+"',"+
        "event_selectors: [{event: 'Conversion'}]"+
      "}).filter(function(ev){"+
        "if(ev.properties['Referrer'] == '"+leader.user+"'){"+
          "return ev;"+
        "}"+
      "})"+
      ".reduce(mixpanel.reducer.count());"+
    "}";

    var leaderInfo,
        bestShareConversions,
        bestShareClickthroughs,
        totalClickthroughs,
        totalConversions;

    MP.api.jql(lookupJQL).done(function(results){
      // console.log('--- Leader Info ---', results);
      leaderInfo = results;
    }).then(function(){
      MP.api.jql(bestShareConversionsJQL).done(function(results){
        // console.log('--- Share Conversions ---', results[0]);
        bestShareConversions = results[0];
      }).then(function(){
        MP.api.jql(bestShareClickthroughsJQL).done(function(results){
          // console.log('--- Share Clickthroughs ---', results[0])
          bestShareClickthroughs = results[0];
        }).then(function(){
          MP.api.jql(totalClickthroughsJQL).done(function(results){
            totalClickthroughs = results[0];
          }).then(function(){
            MP.api.jql(totalConversionsJQL).done(function(results){
              totalConversions = results[0];
            }).then(function(){
              console.log('---===  MASTER BUILD OBJECTS ===---', leader.user);
              console.log(leaderInfo, bestShareConversions, bestShareClickthroughs, totalConversions, totalClickthroughs);
              var $newLeaderCard = $('#' + leaderInfo[0].EmailUserName);
              individualLeaderDOM($newLeaderCard, leaderInfo, bestShareConversions, bestShareClickthroughs, totalConversions, totalClickthroughs);
            });
          })
        });
      });
    })
  });
}

function individualLeaderDOM($domEl, leaderInfo, bestShareConversions, bestShareClickthroughs, totalConversions, totalClickthroughs){
  if(!leaderInfo[0].Pic){
    leaderInfo[0].Pic = 'transparent.png';
  }

  if(!leaderInfo[0].Name){
    leaderInfo[0].Name = leaderInfo[0].EmailUserName;
  }

  var leaderHTML =  '<div class="header">'+
      '<img src="'+leaderInfo[0].Pic+'" />'+
      '<h3>'+leaderInfo[0].Name+'</h3>'+
  '</div>'+
  '<div class="content">'+
      '<div class="row">'+
          '<div class="col-sm-12">'+
              '<div class="panel panel-default">'+
                '<div class="panel-heading"><h5><em class="glyphicon glyphicon-user"></em> Top Converting Share</h5></div>'+
                '<div class="panel-body">'+
                  '<div class="count col-sm-4">'+bestShareConversions[0].value+'<small>Conversions</small></div>'+
                  '<div class="platform col-sm-4"><i class="fa fa-'+bestShareConversions[0].key[1]+'-square"></i><small>Platform</small></div>'+
                  '<div class="content col-sm-4"><i class="'+iconTranslatorClass(bestShareConversions[0].key[0])+'"></i><small>'+bestShareConversions[0].key[0]+'</small></div>'+
                '</div>'+
              '</div>'+
          '</div>'+
          '<div class="col-sm-12">'+
              '<div class="panel panel-default">'+
                '<div class="panel-heading"><h5><i class="fa fa-bullhorn"></i> Top Traffic Generating Share</h5></div>'+
                '<div class="panel-body">'+
                  '<div class="count col-sm-4">'+bestShareClickthroughs[0].value+' <small>Clickthroughs</small></div>'+
                  '<div class="platform col-sm-4"><i class="fa fa-'+bestShareClickthroughs[0].key[1]+'-square"></i><small>Platform</small></div>'+
                  '<div class="content col-sm-4"><i class="'+iconTranslatorClass(bestShareClickthroughs[0].key[0])+'"></i><small>'+bestShareClickthroughs[0].key[0]+'</small></div>'+
                '</div>'+
              '</div>'+
          '</div>'+
          '<div class="col-sm-12">'+
              '<div class="panel panel-default">'+
                '<div class="panel-heading"><h5><i class="fa fa-calculator"></i> Totals</h5></div>'+
                '<div class="panel-body">'+
                  '<div class="platform col-sm-6">'+totalConversions+' <small>Conversions</small></div>'+
                  '<div class="content col-sm-6">'+totalClickthroughs+' <small>Clickthroughs</small></div>'+
                '</div>'+
              '</div>'+
          '</div>'+
      '</div>'+
  '</div>';

  $domEl.append(leaderHTML);
}

function iconTranslatorClass(contentShared){
  if(contentShared === 'story'){
    return 'fa fa-medium'
  } else if(contentShared === 'app'){
    return 'fa fa-sticky-note'
  } else if(contentShared === 'rick'){
    return 'fa fa-smile-o'
  }
}

MP.api.setCredentials('26c54b67a8910fcafe97e528e535d5db');