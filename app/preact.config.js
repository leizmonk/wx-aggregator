import envVars from 'preact-cli-plugin-env-vars';
const preactCliPostCSS = require('preact-cli-postcss');

export default function (config, env, helpers) {
  envVars(config, env, helpers);  
  preactCliPostCSS(config, helpers);
}