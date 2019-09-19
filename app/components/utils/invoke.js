const AWS = require("aws-sdk");
const config = require('./config');
const lambda = new AWS.Lambda(config.awsConfig);
const s3 = new AWS.S3(config.awsConfig);

onSearchSubmit(latLng, zipCode, time, darkSkyPayload) {
  // TODO: Hook this up to API Gateway/AWS Lambda
  console.log(latLng, zipCode, time);
  const payload = {
    latLng: latLng,
    zipCode: zipCode,
    time: time
  };
  var params = {
    FunctionName: 'arn:aws:lambda:us-west-2:444167711672:function:wx-aggregator-serverless-dev-darkSkyApi', /* required */
    ClientContext: AWS.util.base64.encode(JSON.stringify('WX-Aggregator')),
    InvocationType: 'RequestResponse',
    LogType: 'Tail',
    Payload: JSON.stringify(payload) /* Strings will be Base-64 encoded on your behalf */,
  };
  lambda.invoke(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
  });

  let s3Path = 'forecast_data/darksky/' + zipCode + '.json';
  let s3Params = {
    Bucket: 'wx-aggregator',
    Key: s3Path
  }
  const getObjectPromise = s3.getObject(s3Params).promise();

  getObjectPromise.then(function(data) {
    const output = JSON.parse(data.Body);
    darkSkyPayload = JSON.parse(output);

    return darkSkyPayload;
  }).catch(function(err) {
    console.log(err, err.stack);
  }).then((darkSkyPayload) => {
    console.log('------- payload ', darkSkyPayload)
    return darkSkyPayload
  })
}