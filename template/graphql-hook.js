/*
 * @Author: zhanchao.wu
 * @Date: 2020-09-16 18:36:37
 * @Last Modified by: zhanchao.wu
 * @Last Modified time: 2020-12-15 22:39:36
 */
const { toUpper } = require('lodash');
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
/**
 * 外键删除校验
 * @param {*} tableItem
 * @param {*} keyColumnList
 */
const findForeignKey = (tableItem, keyColumnList) => {
  const importList = [];
  const delList = [];
  const bbProperty = [];
  if (keyColumnList.length <= 0) {
    return { strimport: '', strdel: '' };
  }
  const foreignList = keyColumnList.filter((p) => p.REFERENCED_TABLE_NAME === tableItem.name);
  if (foreignList.length <= 0) {
    return { strimport: '', strdel: '' };
  }
  foreignList.forEach((p) => {
    // 当前表主表 主键
    importList.push(`import {
  ${pascalName(p.REFERENCED_TABLE_NAME)}Model,
  ${_.toUpper(p.REFERENCED_TABLE_NAME)},
} from '../models/${p.REFERENCED_TABLE_NAME.replace(/_/g, '-')}.model';`);
    bbProperty.push(pascalName(p.CONSTRAINT_NAME, false));
    delList.push(`        ${pascalName(p.CONSTRAINT_NAME, false)}: ${pascalName(
      p.TABLE_NAME
    )}Model.findOne({
          where: {
            [${_.toUpper(p.TABLE_NAME)}.${_.toUpper(p.COLUMN_NAME)}]: _.get(model, 'where.id'),
          },
        }),`);
  });
  const strdel = `
  async beforeBulkDestroy(model: { where: {id: string}; transaction: Transaction }) {
    const { ${bbProperty.join(', ')} } = await Bb.props({
${delList.join(`
`)}
    });
    if (${bbProperty.join(' || ')}) {
      throw new Error('已使用数据禁止删除');
    }
  }`;
  importList && importList.push(`import * as Bb from 'bluebird';`);
  return {
    strimport: importList.join(`
`),
    strdel,
  };
};

/**
 * 唯一校验
 * @param {*} tableItem
 * @param {*} columnList
 */
const findCommentUnique = (tableItem, columnList) => {
  const rowList = columnList.filter((columnRow) => {
    const regex2 = /\[(unique)\]/g; // [] 中括号
    return columnRow.COLUMN_COMMENT.match(regex2);
  });
  if (rowList.length <= 0) {
    return '';
  }
  console.log(rowList);
  const listPropertyUpdate = rowList
    .map((p, index) => {
      return `
    if (changed.includes(${toUpper(p.TABLE_NAME)}.${_.toUpper(
        p.COLUMN_NAME
      )}) && model.get('${pascalName(p.COLUMN_NAME)}')) {
      const item${index} = await ${pascalName(p.TABLE_NAME)}Model.findOne({
        where: {
          [${toUpper(p.TABLE_NAME)}.${_.toUpper(p.COLUMN_NAME)}]: model.get('${pascalName(
        p.COLUMN_NAME
      )}'),
        },
        transaction: options?.transaction,
      });
      if (item${index}) {
        throw new Error('${p.COLUMN_COMMENT}已存在');
      }
    }
    `;
    })
    .join();

  const listPropertyCreate = rowList
    .map((p, index) => {
      return `
    if (model.get('${pascalName(p.COLUMN_NAME)}')) {
      const item${index} = await ${pascalName(p.TABLE_NAME)}Model.findOne({
        where: {
          [${toUpper(p.TABLE_NAME)}.${_.toUpper(p.COLUMN_NAME)}]: model.get('${pascalName(
        p.COLUMN_NAME
      )}'),
        },
        transaction: options?.transaction,
      });
      if (item${index}) {
        throw new Error('${p.COLUMN_COMMENT}已存在');
      }
    }
    `;
    })
    .join();
  const msg = `
  async beforeUpdate(
    model: DeviceCommunitybucketModel,
    options: { transaction: Transaction; validate: Boolean; returning: Boolean }
  ) {
    const changed = model.changed();
    if (!changed) {
      return;
    }
${listPropertyUpdate}
  }

  async beforeCreate(
    model: DeviceCommunitybucketModel,
    options: { transaction: Transaction; validate: Boolean; returning: Boolean }
  ) {
${listPropertyCreate}
  }
  `;
  return msg;
};

const modelTemplate = (tableItem, keyColumnList, columnList) => {
  const { strimport, strdel } = findForeignKey(tableItem, keyColumnList);
  const uniquestr = findCommentUnique(tableItem, columnList);
  if (!strdel && !uniquestr) {
    return undefined;
  }
  return `import * as _ from 'lodash';
import { provide } from 'midway';
import { Transaction } from 'sequelize/types';
import { ${_.toUpper(tableItem.name)}, ${pascalName(
    tableItem.name
  )}Model } from '../models/${tableItem.name.replace(/_/g, '-')}.model';
${strimport}

@provide('${pascalName(tableItem.name)}Hook')
export class ${pascalName(tableItem.name)}Hook {
${strdel}

${uniquestr}
}
`;
};

/**
 *
 * @param {*} mysqlHelper
 * @param {*} tableItem
 */
const findHook = async (columnList, tableItem, keyColumnList) => {
  return modelTemplate(tableItem, keyColumnList, columnList);
};

module.exports = findHook;
