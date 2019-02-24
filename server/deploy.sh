#! /bin/bash

echo "----- deploy app to s3 bucket -----"

# remove existing app instance
aws s3 rm s3://wx-aggregator/wx-app --recursive

# build the app
cd src
npm run prod && mv assets/ wx-app/

# sync with s3
aws s3 sync wx-app/ s3://wx-aggregator/wx-app --acl public-read
# remove dup app dir
mv wx-app/ assets/

cd ..
