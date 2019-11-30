import { Provider, connect } from 'preact-redux';

const AWS = require("aws-sdk")
const config = require('../utils/config')
const lambda = new AWS.Lambda(config.awsConfig)
const s3 = new AWS.S3(config.awsConfig)

export const REQUEST_FORECASTS = 'REQUEST_FORECASTS'
export const RECEIVE_FORECASTS = 'RECEIVE_FORECASTS'

function onLoad() {
  console.log('loaded invoke')
}

function requestForecasts(forecast) {
  return {
    type: REQUEST_FORECASTS,
    forecast
  }
}

function receiveForecasts(forecast, json) {
  return {
    type: RECEIVE_FORECASTS,
    forecast,
    forecasts: json.data.children.map(child => child.data),
    received: Date.now()
  }
}

function fetchForecasts(latLng, zipCode, time) {
  console.log(latLng, zipCode, time)
  const payload = {
    latLng: latLng,
    zipCode: zipCode,
    time: time
  }
  var params = {
    FunctionName: 'arn:aws:lambda:us-west-2:444167711672:function:wx-aggregator-serverless-dev-darkSkyApi', /* required */
    ClientContext: AWS.util.base64.encode(JSON.stringify('WX-Aggregator')),
    InvocationType: 'RequestResponse',
    LogType: 'Tail',
    Payload: JSON.stringify(payload) /* Strings will be Base-64 encoded on your behalf */,
  }
  lambda.invoke(params, (err, data) => {
    if (err) console.log(err, err.stack) // an error occurred
    else     console.log('returned raw data: ', data) // successful response
  })
  let s3Path = 'forecast_data/darksky/' + zipCode + '.json'
  let s3Params = {
    Bucket: 'wx-aggregator',
    Key: s3Path
  }
  const getObjectPromise = s3.getObject(s3Params).promise()

  return dispatch => {
    dispatch(requestForecasts(forecast))
    return getObjectPromise.then((data) => {
      const output = JSON.parse(data.Body)
      darkSkyPayload = JSON.parse(output)
    }).catch((err) => {
      alert('Error retrieving data')
      console.log(err, err.stack)
    }).then((data) => {
      console.log('parsed payload: ', darkSkyPayload)
      console.log('calling datamapper from inovke')
      dispatch(receiveForecasts(forecast, darkSkyPayload))
    })
  }
}

// onSearchSubmit: (latLng, zipCode, time) => {
//   // TODO: Hook this up to API Gateway/AWS Lambda
//   console.log(latLng, zipCode, time)
//   const payload = {
//     latLng: latLng,
//     zipCode: zipCode,
//     time: time
//   }
//   var params = {
//     FunctionName: 'arn:aws:lambda:us-west-2:444167711672:function:wx-aggregator-serverless-dev-darkSkyApi', /* required */
//     ClientContext: AWS.util.base64.encode(JSON.stringify('WX-Aggregator')),
//     InvocationType: 'RequestResponse',
//     LogType: 'Tail',
//     Payload: JSON.stringify(payload) /* Strings will be Base-64 encoded on your behalf */,
//   }
//   lambda.invoke(params, (err, data) => {
//     if (err) console.log(err, err.stack) // an error occurred
//     else     console.log('returned raw data: ', data)           // successful response
//   })

//   let s3Path = 'forecast_data/darksky/' + zipCode + '.json'
//   let s3Params = {
//     Bucket: 'wx-aggregator',
//     Key: s3Path
//   }
//   const getObjectPromise = s3.getObject(s3Params).promise()

//   getObjectPromise.then((data) => {
//     const output = JSON.parse(data.Body)
//     darkSkyPayload = JSON.parse(output)

//     return data
//   }).catch((err) => {
//     alert('Error retrieving data')
//     console.log(err, err.stack)
//   }).then((data) => {
//     console.log('parsed payload: ', darkSkyPayload)
//     console.log('calling datamapper from inovke')
//     dataMapper.darkSkyDataMapper(darkSkyPayload)
//   })
// }
