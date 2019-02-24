module.exports = function () {
  return {
    plugins: [
      require('autoprefixer')({}),
      require('postcss-extend')({}),
      require('postcss-import')({}),
      require('postcss-mixins')({}),
      require('postcss-nested')({}),
      require('postcss-simple-vars')({})
    ]
  }
};