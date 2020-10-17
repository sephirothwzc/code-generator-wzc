const _ = require('lodash');
module.exports = (name, upper) => {
  if (upper) {
    return _.upperFirst(_.camelCase(name));
  }
  return _.camelCase(name);
};
