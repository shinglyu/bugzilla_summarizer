var https = require('https');
var fs = require('fs');
var url = "https://bugzilla.mozilla.org/rest/bug/1023688/history";
//var infile = '../test/mock_history.json'
var infile = '../test/1023688_history.json'
var outfile = "./demodata_history.json"

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
  //console.log(fieldnames)

  var changes = [];

  var id = 0
  histories.map(function(h){
    h.changes.map(function(c){
      c.added.split(',').map(function(a){
        if (a == "") {
          return
        }
        var node = {}
        node.name = a.trim()
        node.type = c.field_name;
        node.action= "+";
        node.id = id;
        id += 1;
        node.date = h.when
        node.from = "R"
        changes.push(node)
      });
      c.removed.split(',').map(function(a){
        if (a == "") {
          return
        }
        var node = {}
        node.name = a.trim()
        node.type = c.field_name;
        node.action = "-";
        node.id = id;
        id += 1;
        node.date = h.when
        node.from = "R"
        changes.push(node)
      });
    })
  })


  links = generateLinks(changes);
  parsed = {"nodes": changes, "links": links}
  console.log(JSON.stringify(parsed, null, 2))
  fs.writeFile(outfile, JSON.stringify(parsed, null, 2))

  /*
  for (var time in changes) {
    var arr = Object.keys(changes[time]).map(function(key) {return changes[time][key]})
    var msg = arr.join('\t')
    console.log(msg);

  }
  */
}

function generateLinks(changes){
  stack = {}
  changes.map(function(node){

    if (!stack.hasOwnProperty(node.type)) {
      stack[node.type] = {}
    }
    //else {
    //console.log(node)
    if (!stack[node.type].hasOwnProperty(node.name)) {
      //console.log("created new")
      stack[node.type][node.name] = [node]
    }
    else {
      //console.log("pushed")
      stack[node.type][node.name].push(node);
    }
    //}
  })

  //console.log(stack)
  links = []
  for (var type in stack) {
    for (var name in stack[type]){
      //console.log('---')
      if (stack[type][name].length > 1) {
        nodes = stack[type][name]
        for (var i = 1; i < nodes.length; i++) {
          //console.log(nodes[i-1])
          links.push({"source": nodes[i-1].id, "target": nodes[i].id, "type": "answeredby"})
          
        }
        //console.log(nodes[nodes.length-1])
      }
    }
  }
  
  return links
}

/*
https.get(url, function(res) {
  var body = '';

  res.on('data', function(chunk) {
    body += chunk;
  });

  res.on('end', function() {
    var response = JSON.parse(body);
    //console.log("Got response: ", response);
    parseHistory(response);
  });

}).on('error', function(e) {
  //console.log("Got error: ", e);
});
*/

fs.readFile(infile, function(err, data){
  if (err) throw err;
  //console.log(data)
  parseHistory(JSON.parse(data))
})
