'use strict';

module.exports = agent => {
  console.log('agent.config.env =', agent.config.env);
  require('./lib/loader')(agent);
};
