'use strict';

// TODO: seq 下如何判断是必填的字段

module.exports = app => {
  const { STRING, INTEGER } = app.Sequelize;
  const Person = app.model.define('person', {
    name: STRING(30),
    age: INTEGER,
  });

  const typeName = Person.name;

  Person.setting = {
    plural: 'people',
    description: 'Person description',
  };

  Person.remotes = {
    foo: {
      summary: 'summary for Persion.prototype.foo',
      accepts: [
        { arg: 'id', type: 'integer', description: 'Model id', required: true,
          http: { source: 'path' } },
      ],
      returns: { arg: 'data', model: typeName, root: true },
      http: { verb: 'post', path: '/:id/foo' },
    },
  };

  return Person;
};
