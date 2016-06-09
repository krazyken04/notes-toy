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
  MP.api.funnel('Conversion', 'Content Shared', {
    from: dateSelector.val().from,
    to: dateSelector.val().to,
    length: 14
  }, function(results){
    console.log('--Conversion Rates for Sharing--',results);
    var conv_ratio = { 'Share Conversion Rate' : null};

    var keysOut = _.pairs(results[1]);
    var CRObjs = {};
    _.each(keysOut, function(day){
      CRObjs[day[0]] = day[1].overall_conv_ratio * 100;
    });

    conv_ratio["Share Conversion Rate"] = CRObjs;
    console.log(conv_ratio);

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
    console.log('-- NOTES --',results);

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
  console.log(temporaryObject);
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

MP.api.setCredentials('26c54b67a8910fcafe97e528e535d5db');