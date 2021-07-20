const express = require("express");
const request = require("request-promise");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded((extended = true))); // Allows to read the form data .For strings in forms --> urlencoded

mongoose
  .connect(
    "mongodb+srv://username:password@project-wiqmt.mongodb.net/test?retryWrites=true&w=majority"
  )
  .then(() => console.log("MongoDb connected.."))
  .catch((err) => console.log(err));

const citySchema = new mongoose.Schema({
  name: String,
});

const cityModel = mongoose.model("City", citySchema);

// var lasvegas = new cityModel({name:'Las Vegas'})
// var toronto = new cityModel({name:'Toronto'})
// var sydney = new cityModel({name:'Sydney'})
// lasvegas.save()
// toronto.save()
// sydney.save()

async function getWeather(cities) {
  var weather_data = [];

  for (var city_obj of cities) {
    var city = city_obj.name;
    var url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&APPID=f73a7845017ac7713747ad3db841233e`;

    var response_body = await request(url);
    var weather_json = JSON.parse(response_body);

    var weather = {
      city: city,
      temperature: Math.round(weather_json.main.temp),
      description: weather_json.weather[0].description,
      icon: weather_json.weather[0].icon,
    };

    weather_data.push(weather);
  }

  return weather_data;
}

var city = "Las Vegas";

app.get("/", function (req, res) {
  cityModel.find({}, function (err, cities) {
    getWeather(cities).then(function (results) {
      var weather_data = { weather_data: results };

      res.render("weather", weather_data);
    });
  });
});

app.post("/", function (req, res) {
  var newCity = new cityModel({
    name: req.body.city_name, // Form ko name = city_name so teii name ko form ko data taneko
  });
  newCity.save();

  res.redirect("/");
});

app.listen(8000);
