'use strict';

class AccessContext {
  constructor(ctx, model, modelName, property) {
    this.ctx = ctx;
    this.model = model;
    this.modelName = modelName;

    this.property = property;
  }

}


module.exports = AccessContext;
