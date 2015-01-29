var https = require('https');
var url = "https://bugzilla.mozilla.org/rest/bug/1023688/history";

function parseHistory(response) {
  var histories = response.bugs[0].history;
  //sort?
  var fieldnames = [];
  histories.map(function(h){
    h.changes.map(function(c){
      if (fieldnames.indexOf(c.field_name) < 0) {
        fieldnames.push(c.field_name)
      }
    })
  })
  console.log(fieldnames)

  var changes = {};
  histories.map(function(h){
    if (h.when in changes) {
      h.changes.map(function(c){
        changes[h.when][c.field_name].push(c);
        /*
        if (c.field_name in changes[h.when]) {
          changes[h.when][c.field_name].push(c);
        }
        else {
          changes[h.when][c.field_name] = [c];
        }
        */
      })
    }
    else {
      var entry = {when: h.when};
      fieldnames.map(function(f){entry[f] = []})
      changes[h.when] = entry

      h.changes.map(function(c){
        changes[h.when][c.field_name].push(c);
      })
    }
  })

  for (var time in changes) {
    var arr = Object.keys(changes[time]).map(function(key) {return changes[time][key]})
    var msg = arr.join('\t')
    console.log(msg);

  }
}

https.get(url, function(res) {
  var body = '';

  res.on('data', function(chunk) {
    body += chunk;
  });

  res.on('end', function() {
    var response = JSON.parse(body);
    console.log("Got response: ", response);
    parseHistory(response);
  });

}).on('error', function(e) {
  console.log("Got error: ", e);
});
