#! /bin/bash

echo "----- deploying app to s3 bucket -----"

# remove existing app instance
echo "----- removing stale app instance -----"
aws s3 rm s3://wx-aggregator/ --recursive --exclude 'forecast_data/*' --profile "wxaggregator"

# build the app
echo "----- putting together new production build -----"
cd ../app
npm run build --no-prerender && mv build/ wx-aggregator-app/

# sync with s3
echo "----- uploading current build to s3 -----"
aws s3 sync wx-aggregator-app/ s3://wx-aggregator/ --acl public-read --profile "wxaggregator"

echo "----- clearing local production build artifacts -----"
# remove dup app dir
cd ../app
rm -rf wx-aggregator-app/ && rm -rf build/