/*
 * @Author: zhanchao.wu
 * @Date: 2020-09-16 18:36:37
 * @Last Modified by: zhanchao.wu
 * @Last Modified time: 2020-10-18 10:42:33
 */
const _ = require('lodash');
const pascalName = require('../utils/name-case');

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
  const txtImport = new Set();
  const txtProp = new Set();
  const propsSetList = new Set();

  keyColumnList
    .filter((p) => p.TABLE_NAME === tableItem.name)
    .forEach((p) => {
      txtImport.add(
        `import { I${pascalName(
          p.REFERENCED_TABLE_NAME
        )}Service } from './${p.REFERENCED_TABLE_NAME.replace(/_/g, '-')}.service';`
      );
      txtProp.add(`  @inject()
  ${pascalName(p.REFERENCED_TABLE_NAME, false)}Service: I${pascalName(
        p.REFERENCED_TABLE_NAME
      )}Service;`);
      propsSetList.add(`      if (values.${pascalName(
        p.COLUMN_NAME,
        false
      )}Obj && !values.${pascalName(p.COLUMN_NAME, false)}) {
        values.${pascalName(p.COLUMN_NAME, false)} = (
          await this.${pascalName(
            p.REFERENCED_TABLE_NAME,
            false
          )}Service.create(values.${pascalName(p.COLUMN_NAME, false)}Obj, {
            transaction: t,
          })
        ).get('id');
      }`);
    });
  if (txtImport.size <= 0 || txtProp.size <= 0) {
    // 为空不生成
    return {
      createOptions: '',
      txtImport: '',
    };
  }
  const propsString = Array.from(txtProp).join(`
`);
  const propsSetString = Array.from(propsSetList).join(`
`);
  const createString = `
${propsString}
  /**
   * 新增
   * @param values
   */
  public async create(values: ${pascalName(
    tableItem.name
  )}Model, useOptions?: CreateOptions): Promise<${pascalName(tableItem.name)}Model> {
    const run = async (t: Transaction) => {
${propsSetString}
      return super.create(values, {
        transaction: t,
      });
    };
    return await this.useTransaction(run, useOptions);
  }
  `;
  return {
    createString,
    txtImport: Array.from(txtImport).join(`
`),
  };
};

const modelTemplate = (tableItem, keyColumnList) => {
  const { createString, txtImport } = findForeignKey(tableItem, keyColumnList);
  return `import { provide, inject } from 'midway';
import { CreateOptions, Transaction } from 'sequelize/types';
import { ServiceGenericBase } from '../lib/base/service-generic.base';
import { I${pascalName(tableItem.name)}Model, ${pascalName(
    tableItem.name
  )}Model } from '../lib/models/${tableItem.name.replace(/_/g, '-')}.model';
${txtImport}

export interface I${pascalName(tableItem.name)}Service extends ${pascalName(
    tableItem.name
  )}Service {}

@provide()
export class ${pascalName(tableItem.name)}Service extends ServiceGenericBase<${pascalName(
    tableItem.name
  )}Model> {
  get Model(): any {
    return this.${_.camelCase(tableItem.name)}Model;
  }
  
  @inject()
  ${_.camelCase(tableItem.name)}Model: I${pascalName(tableItem.name)}Model;
${createString}
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
