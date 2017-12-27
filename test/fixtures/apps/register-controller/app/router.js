'use strict';

module.exports = app => {
  app.get('/', function* () {
    this.body = 'hi, ' + app.plugins.connectorRemote.name;
  });
  app.registerRemote(app.model.Cate);
  // app.get('/api/v1/cates', function* () {
  //   this.body = 'hi';
  // });
};

