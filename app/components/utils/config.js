const awsConfig = {
  region:'us-west-2',
  accessKeyId: process.env.PREACT_APP_AWS_ACCESS_KEY_ID, 
  secretAccessKey: process.env.PREACT_APP_AWS_SECRET_ACCESS_KEY  
}

/* TODO: need to dynamically populate key with ZIP searched to get the right file */
const s3Params = {
  Bucket: 'wx-aggregator',
  Key: 'forecast_data/darksky/11435.json'
}
