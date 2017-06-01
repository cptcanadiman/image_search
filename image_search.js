var express = require('express')
var app = express()

app.get("/",function(req,res){
    res.send("Getting root...")
})

app.listen(8080,function(){
    console.log("App running on port" + " " + 8080)
})
