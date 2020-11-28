require('dotenv').config();
const express = require('express');
const bodyParser= require('body-parser')
const mongo = require('mongodb').MongoClient;
const app = express();

const MongoClient = require('mongodb').MongoClient;
const uri = process.env.DB_URI; 


app.get('/show/:name', (req, res) => {
  getTvShow(req.params.name, res); 
});


app.listen(3000, function() {
  console.log('listening on 3000')
});

function getTvShow(name,res){
  const client = new MongoClient(uri, {useUnifiedTopology: true, useNewUrlParser: true  });
  client.connect( (err, db) => {
    const collection = client.db("episode_finder").collection("tv_shows");
    let query = {name: name};
    collection.findOne(query, (err, result) => {
      if (err){
        res.status(404).send("404");
        throw err;
      } 
      res.status(200).send(result);    
      db.close();
    });
  });
}