/*
 * @Author: zhanchao.wu
 * @Date: 2020-09-16 18:36:37
 * @Last Modified by: zhanchao.wu
 * @Last Modified time: 2020-09-16 18:42:54
 */
const _ = require('lodash');
const inflect = require('i')();

const modelTemplate = (tableItem) => {
  return `import { provide, inject } from 'midway';
import { ServiceBase } from '../lib/base/service.base';
import { I${inflect.camelize(tableItem.name)}Model } from '../lib/models/${tableItem.name.replace(/_/g, '-')}.model';

export interface I${inflect.camelize(tableItem.name)}Service extends ${inflect.camelize(tableItem.name)}Service {}

@provide()
export class ${inflect.camelize(tableItem.name)}Service extends ServiceBase {
  get Model(): any {
    return this.${_.camelCase(tableItem.name)}Model;
  }
  @inject()
  ${_.camelCase(tableItem.name)}Model: I${inflect.camelize(tableItem.name)}Model;
}
`;
};

/**
 *
 * @param {*} mysqlHelper
 * @param {*} tableItem
 */
const findservice = async (columnList, tableItem) => {
  return modelTemplate(tableItem);
};

module.exports = findservice;
