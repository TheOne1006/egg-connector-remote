'use strict';

module.exports = app => {
  app.get('/', function* () {
    this.body = 'hi, ' + app.plugins.connectorRemote.name;
    // this.body = this.csrf;
  });
  app.registerRemote(app.model.User);
  // app.registerRemote(app.model.Article);
  // app.get('/api/v1/cates', function* () {
  //   this.body = 'hi';
  // });
};
