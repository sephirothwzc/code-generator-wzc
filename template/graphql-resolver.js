/*
 * @Author: zhanchao.wu
 * @Date: 2020-09-16 18:36:37
 * @Last Modified by: zhanchao.wu
 * @Last Modified time: 2020-09-17 09:49:20
 */
const _ = require('lodash');
// const inflect = require('i')();

const modelTemplate = (tableItem) => {
  return `const resolverUtil = require('../utils/resolver.util');
const { Query, Mutation, getService } = resolverUtil('${_.camelCase(tableItem.name)}');

module.exports = {
  Query,
  Mutation,
};
`;
};

/**
 *
 * @param {*} mysqlHelper
 * @param {*} tableItem
 */
const findresolver = async (columnList, tableItem) => {
  return modelTemplate(tableItem);
};

module.exports = findresolver;
