#! /bin/bash

echo "----- deploy app to s3 bucket -----"

# remove existing app instance
aws s3 rm s3://wx-aggregator/wx-aggregator-app --recursive --profile "wxaggregator"

# build the app
cd ../app
npm run build --no-prerender && mv build/ wx-aggregator-app/

# sync with s3
aws s3 sync wx-aggregator-app/ s3://wx-aggregator/wx-aggregator-app/ --acl public-read --profile "wxaggregator"
# remove dup app dir
mv wx-aggregator-app/ build/

cd ..

# To Do: 
# Modify serverless IAM role to be able to create s3 objects for deploys