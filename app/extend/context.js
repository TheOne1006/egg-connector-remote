'use strict';
const sourceFormDataSymbol = Symbol('Context#sourceFormData');
const sourceFormDataInitSymbol = Symbol('Context#sourceFormDataInit');

module.exports = {
  async getFormData() {
    const source = {};
    if (!this[sourceFormDataInitSymbol]) {
      const ctx = this;

      const parts = ctx.multipart();
      // await parts();
      let part;
      let hasNext = true;

      // hack 兼容, parts 无法正确返回最后一组数据
      while (hasNext) {
        const timeout = new Promise(resolve => {
          setTimeout(() => {
            resolve(false);
          }, 500);
        });

        part = await Promise.race([ parts(), timeout ]);
        if (part === false) {
          hasNext = false;
        } else {
          if (part && part.length) {
            // 加载字段
            source[part[0]] = part[1];
          } else if (part && part.filename && part.fieldname) {
            source[part.fieldname] = part;
          }
        }
      }

      this[sourceFormDataInitSymbol] = true;
      this[sourceFormDataSymbol] = source;
    }
    return this[sourceFormDataSymbol] || source;
  },
};
