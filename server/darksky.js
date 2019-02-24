"use strict";
const https = require("https")
const fs = require("fs")
const AWS = require("aws-sdk")
AWS.config.update({region:'us-west-2'})
const Promise = require("bluebird")
const lambda = new AWS.Lambda()
const util = require("util")

const s3 = new AWS.S3()
const params = {params: {Bucket: "wx-aggregator", Key: "darkSkyWeatherData"}}

module.exports.getDarkSkyWeatherAPIData = (event, context, callback) => {
  const requestParameters = {
    host: "api.darksky.net",
    path: "/forecast/89433283494568b5b6820bc83be72d48/40.7536,-73.9893"
  } 

  function fetchDarkSkyAPIData () {
    return new Promise((resolve, reject) => {
      https.get(requestParameters, (res) => {
        let payload = ''
        res.on('data', (data) => {
          payload += data
          resolve(payload)
        })
      })
    })
  }
  
function createNewJSONOfLatestWeatherDataInS3(s3Params, weatherJSONData) {
  let putObjectParams = {
    Bucket: "wx-aggregator",
    Key: "forecastResults.json",
    Body: weatherJSONData
  }

  // Promise.resolve(
  //   fs.writeFile("/tmp/forecastResults.json", weatherJSONData, (file) => {
  //     putObjectParams.Body = file
  //   })
  // )
  // .then(() => {
    console.log(`putObjectParams.body: ${putObjectParams.Body}`)
    s3.putObject(putObjectParams, (err) => { 
      if (err) {
        console.log(`Error uploading weather API data to S3 json file: ${err}`)
        throw err
      } else {
        console.log("Successfully uploaded latest weather data to JSON")
      }
    })
  // })
}

  try {
    fetchDarkSkyAPIData().then((weatherJSONData) => {
      let s3Params = {
        Bucket: "wx-aggregator",
        Key: "forecastResults.json",
        Body: weatherJSONData
      }

      return s3.getObject(params, (err, data) => {
        if (err) {
          // weather data json file doesn"t exist, create it and write to it
          createNewJSONOfLatestWeatherDataInS3(s3Params, weatherJSONData)
        } else {
          console.log('Existing JSON detected. Deleting Old Weather Data...')
          // deleteOutdatedWeatherDataFromS3Json(s3, s3Params).then(() => {
            // Insert latest data in a new file on the s3 bucket
            createNewJSONOfLatestWeatherDataInS3(s3Params, weatherJSONData)
          // })
        }
      })
    })
  }
  catch(err) {
    callback(err)
  }

}