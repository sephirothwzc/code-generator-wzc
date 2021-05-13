const _ = require('lodash');
/**
 * 命名转换
 * @param {string} name
 * @param {bool} upper 帕斯卡命名
 */
module.exports = (name, upper = true) => {
  if (upper) {
    return _.upperFirst(_.camelCase(name));
  }
  return _.camelCase(name);
};
