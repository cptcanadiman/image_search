var datetime = require('node-datetime')
var express = require('express')
var giSearch = require('google-images')
var request = require('request')
var mongodb = require('mongodb')
var MongoClient = mongodb.MongoClient
var app = express()
var client = new giSearch('008805169728341063477:n1yqqqzw9oi', 'AIzaSyAcgocbJ_a3Tv5m8pWFtj4K2W1Fazqr6Ug')
var api_key = "AIzaSyAcgocbJ_a3Tv5m8pWFtj4K2W1Fazqr6Ug"
var cse_id = "008805169728341063477:n1yqqqzw9oi"
var url = ""
var link = ""
var snip = ""
var site = ""
var mlaburl = "mongodb://cptcanadiman:murphy79@ds111262.mlab.com:11262/imagesearch"
var searchRes = [];
app.use(express.static("Public"))

app.get("/api/imagesearch/:QUERY-:PAGES", function(req,res){
    var searchTerm = req.params.QUERY
    var pageNumber = req.params.PAGES
    toDB(searchTerm)
    url = 'https://www.googleapis.com/customsearch/v1' + '?key=' + api_key + '&cx=' + cse_id + '&searchType=image' + '&q=' + searchTerm + '&start=' + pageNumber
    request(url, function(error, response, body) {
    body = JSON.parse(body);
    link = body.items[0].link
    snip = body.items[0].snippet
    site = body.items[0].image.contextLink
    var imgObj = {}
    var imgArray = []
    for (var i =0;i<10;i++){
        imgObj = {'link':body.items[i].link,
                  'Snippet':body.items[i].snippet,
                  'Site':body.items[i].image.contextLink
                    }
        imgArray.push(imgObj)
        imgObj = {}
    }
       res.send(imgArray)
    });
})

app.get("/api/latest", function(req,res){
    
        MongoClient.connect(mlaburl, function(err,database){
            db = database
        if(err) {console.log("Reading DB problem...")} 
         db.collection('imagesearch', function(err, collection) {});
         var collection = db.collection('imagesearch');
         collection.find({},{_id:0}).toArray(function(err,item){
            searchRes = item
            if (searchRes.length<=10) {
                res.send(searchRes)
            } else
            var latestTen = [];
            for (var j = 1;j<11;j++) {
               latestTen.push(searchRes[searchRes.length - j])
            }
            res.send(latestTen)
        })   
        db.close()  
    })
})

function toDB(searchReq) {
    MongoClient.connect(mlaburl, function(err, db) {
    if(err) { return console.dir(err); }
    console.log("Sending to DB...")
    db.collection('imagesearch', function(err, collection) {});
    
      var collection = db.collection('imagesearch');
      var timeStamp = getTime()
      var doc1 = {'time':timeStamp,'search string':searchReq};
      collection.insert(doc1);
      db.close()
})
}

function getTime() {
    var dt = datetime.create();
    var formatted = dt.format('m/d/Y H:M:S');
    return formatted
}







app.listen(8080,function(){
    console.log("App running on port" + " " + 8080)
})
