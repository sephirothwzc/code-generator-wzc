/*
 * @Author: zhanchao.wu
 * @Date: 2020-04-09 19:57:34
 * @Last Modified by: zhanchao.wu
 * @Last Modified time: 2020-10-29 15:53:41
 */
const _ = require('lodash');
const pascalName = require('../utils/name-case');
// 是否添加引用
let txtImport = new Set();

const notColumn = [
  'id',
  'created_at',
  'updated_at',
  'deleted_at',
  'created_user',
  'updated_user',
  'created_id',
  'updated_id',
  'deleted_id',
  'i18n',
  'business_code',
];

const findTypeTxt = (columnRow) => {
  switch (columnRow.DATA_TYPE) {
    case 'bigint':
    case 'nvarchar':
    case 'varchar':
      return 'string';
    case 'timestamp':
    case 'int':
    case 'decimal':
    case 'double':
      return `number`;
    case 'datetime':
      return `DateTime`;
    case 'boolean':
    case 'tinyint':
      return 'boolean';
    case 'json':
      return 'Record<string, any>';
    default:
      return 'string';
  }
};

const findSequelizeType = (element) => {
  switch (element.DATA_TYPE) {
    case 'nvarchar':
    case 'varchar':
      return `STRING(${element.CHARACTER_MAXIMUM_LENGTH})`;
    case 'datetime':
      return `DATE`;
    case 'timestamp':
    case 'int':
      return `INTEGER`;
    case 'decimal':
      return `DECIMAL`;
    case 'boolean':
    case 'tinyint':
      return 'BOOLEAN';
    case 'bigint':
      return 'BIGINT';
    case 'double':
      return 'DOUBLE';
    case 'json':
      return 'JSON';
    case 'mediumtext':
      return `TEXT('mediumtext')`;
    case 'multilinestring':
      return `TEXT('multilinestring')`;
    case 'text':
      return 'TEXT';
    case 'tinytext':
      return `TEXT('tinytext')`;
    case 'enum':
      return element.COLUMN_TYPE.replace('enum', 'ENUM');
  }
};

/**
 * comment [info 1 初始化,close 0 关闭] or [info 初始化,close 关闭]or [info,close]
 * @param {*} columnRow 行
 */
const findEnum = (tableName, columnRow) => {
  let value;
  if (!columnRow.COLUMN_COMMENT && columnRow.DATA_TYPE !== 'enum') {
    return undefined;
  }
  if (columnRow.COLUMN_COMMENT) {
    const regex2 = /\[(.+?)\]/g; // [] 中括号
    value = columnRow.COLUMN_COMMENT.match(regex2);
    if (value) {
      value = value[value.length - 1].replace('[', '').replace(']', '');
    }
  }
  if (columnRow.DATA_TYPE === 'enum' && !value) {
    value = columnRow.COLUMN_TYPE.replace('enum', '').replace(/[()']/g, '');
  }
  if (!value) {
    return undefined;
  }
  const ee = value
    .split(/[,，]/)
    .map((p) => {
      const rd3 = p.split(' ');
      if (rd3.length === 3) {
        const val = rd3[1] ? ` = '${rd3[1]}'` : '';
        return `  /**
   * ${rd3[2]}
   */
  ${rd3[0]}${val},
`;
      } else if (rd3.length === 2) {
        return `  /**
   * ${rd3[1]}
   */
  ${rd3[0]} = '${rd3[0]}',
`;
      } else {
        return `  /**
   *
   */
  ${rd3[0]} = '${rd3[0]}',
`;
      }
    })
    .join('');
  const enumTypeName = pascalName(columnRow.COLUMN_NAME);
  const txt = `
export enum E${pascalName(tableName)}${enumTypeName} {
  all = '',
${ee}
}
`;

  return {
    enumTypeName: `E${pascalName(tableName)}${enumTypeName}`,
    txt,
  };
};

/**
 * field 不设置null
 * @param {*} typeString
 * @param {*} enumTypeName
 * @param {*} sequelizeType
 * @param {*} columnRow
 */
const findProperty = (typeString, enumTypeName, sequelizeType, columnRow) => {
  return `  /**
   * ${columnRow.COLUMN_COMMENT || columnRow.COLUMN_NAME}
   */
  ${pascalName(columnRow.COLUMN_NAME, false)}: ${enumTypeName || typeString};
`;
};

/**
 * 根据key生成主外建对象 增加 import
 * @param {*} typeString
 * @param {*} enumTypeName
 * @param {*} sequelizeType
 * @param {*} columnRow
 */
const findForeignKey = (tableItem, keyColumnList) => {
  // @Field({ description: '编码', nullable: true })
  return keyColumnList
    .map((p) => {
      if (p.TABLE_NAME === tableItem.name) {
        p.REFERENCED_TABLE_NAME !== p.TABLE_NAME &&
          txtImport.add(
            `import { ${pascalName(
              p.REFERENCED_TABLE_NAME
            )}Model } from './${p.REFERENCED_TABLE_NAME.replace(/_/g, '-')}.model';`
          );
        // 子表 外键 BelongsTo
        return `
  ${pascalName(p.COLUMN_NAME, false)}Obj: ${pascalName(p.REFERENCED_TABLE_NAME)}Model;
`;
      } else {
        p.REFERENCED_TABLE_NAME !== p.TABLE_NAME &&
          txtImport.add(
            `import { ${pascalName(p.TABLE_NAME)}Model } from './${p.TABLE_NAME.replace(
              /_/g,
              '-'
            )}.model';`
          );
        // 主表 主键 Hasmany
        return `
  ${pascalName(p.TABLE_NAME, false)}${pascalName(p.COLUMN_NAME)}: Array<${pascalName(
          p.TABLE_NAME
        )}Model>;
`;
      }
    })
    .join('');
};

const modelTemplate = (propertyTxt, enumTxt, registerEnumType, tableItem, keyColums) => {
  return `import type { BaseModel } from 'cyberstone-modules/graphql/base-model';
${Array.from(txtImport).join(`
`)}
// #region enum${enumTxt}
${registerEnumType}
// #endregion

/**
 * ${tableItem.comment}
 */
export declare class ${pascalName(tableItem.name)}Model extends BaseModel {
${propertyTxt}${keyColums}
}
`;
};

/**
 *
 * @param {*} mysqlHelper
 * @param {*} tableItem
 */
const findhelper = async (columnList, tableItem, keyColumnList) => {
  txtImport = new Set();
  let enumTxt = '',
    propertyTxt = '',
    registerEnumType = '',
    keyColums = '';
  columnList
    .filter((p) => !notColumn.includes(p.COLUMN_NAME))
    .forEach((p) => {
      // columnList.forEach(p => {
      keyColums = findForeignKey(tableItem, keyColumnList);
      const typeString = findTypeTxt(p);
      const colEnum = findEnum(tableItem.name, p);
      enumTxt += _.get(colEnum, 'txt', '');
      registerEnumType += _.get(colEnum, 'registerEnumType', '');
      const sequelizeType = findSequelizeType(p);
      propertyTxt += findProperty(
        typeString,
        _.get(colEnum, 'enumTypeName'),
        sequelizeType,
        p,
        keyColumnList,
        tableItem
      );
    });
  return modelTemplate(propertyTxt, enumTxt, registerEnumType, tableItem, keyColums);
};

module.exports = findhelper;
