/*
 * @Author: zhanchao.wu
 * @Date: 2020-09-16 18:36:37
 * @Last Modified by: zhanchao.wu
 * @Last Modified time: 2020-09-17 18:58:26
 */
const _ = require('lodash');
const inflect = require('i')();

/**
 * 
 * RowDataPacket {
    TABLE_SCHEMA: 'integral_recycling_dev',
    REFERENCED_TABLE_NAME: 'goods_type',
    REFERENCED_COLUMN_NAME: 'id',
    TABLE_NAME: 'goods',
    COLUMN_NAME: 'goods_type_id',
    CONSTRAINT_NAME: 'goods_ibfk_1',
    TABLE_COMMENT: '商品信息',
    UPDATE_RULE: 'NO ACTION',
    DELETE_RULE: 'NO ACTION'
  },
 */

const findForeignKey = (tableItem, keyColumnList) => {
  const txtImport = [];
  // @Field({ description: '编码', nullable: true })
  const txtIf = keyColumnList
    .filter((p) => p.REFERENCED_TABLE_NAME === tableItem.name)
    .map((p) => {
      return `!param.${inflect.camelize(p.TABLE_NAME, false)}`;
    })
    .join(` && `);
  const txtObj = keyColumnList
    .filter((p) => p.REFERENCED_TABLE_NAME === tableItem.name)
    .map((p) => {
      txtImport.push(`import { ${inflect.camelize(p.TABLE_NAME)}Model } from '../lib/models/${inflect.camelize(p.TABLE_NAME, false)}.model';`);
      return `param.${inflect.camelize(p.TABLE_NAME, false)} &&
      param.${inflect.camelize(p.TABLE_NAME, false)}.length > 0 &&
      include.push({ association: ${inflect.camelize(p.TABLE_NAME)}Model, as: '${inflect.camelize(p.TABLE_NAME, false)}' });`;
    }).join(`
    `);
  if (!txtIf) {
    // 为空不生成
    return { createOptions: '', txtImport };
  }
  const createOptions = `
  createOptions(
    param: any
  ): { include?: [any]; transaction?: any; validate?: boolean } {
    if (${txtIf}) {
      return {};
    }
    const include: any = [];
    ${txtObj}
    return { include };
  }`;
  return { createOptions, txtImport };
};

const modelTemplate = (tableItem, keyColumnList) => {
  const { createOptions, txtImport } = findForeignKey(tableItem, keyColumnList);
  return `import { provide, inject } from 'midway';
import { ServiceBase } from '../lib/base/service.base';
import { I${inflect.camelize(tableItem.name)}Model } from '../lib/models/${tableItem.name.replace(/_/g, '-')}.model';
${txtImport.join(`
`)}

export interface I${inflect.camelize(tableItem.name)}Service extends ${inflect.camelize(tableItem.name)}Service {}

@provide()
export class ${inflect.camelize(tableItem.name)}Service extends ServiceBase {
  get Model(): any {
    return this.${_.camelCase(tableItem.name)}Model;
  }
  
  @inject()
  ${_.camelCase(tableItem.name)}Model: I${inflect.camelize(tableItem.name)}Model;
  ${createOptions}
}
`;
};

/**
 *
 * @param {*} mysqlHelper
 * @param {*} tableItem
 */
const findservice = async (columnList, tableItem, keyColumnList) => {
  return modelTemplate(tableItem, keyColumnList);
};

module.exports = findservice;
