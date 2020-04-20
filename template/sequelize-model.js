/*
 * @Author: 王肇峰 
 * @Date: 2020-04-20 14:10:46 
 * @Last Modified by: 王肇峰
 * @Last Modified time: 2020-04-20 16:24:21
 */

const _ = require('lodash');
const inflect = require('i')();

const notColumn = [
  'id',
  'created_at',
  'updated_at',
  'deleted_at',
];

const findTypeTxt = columnRow => {
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
      return `Date`;
    case 'boolean':
      return 'boolean';
    case 'json':
      return 'Record<string, any>';
  }
}

const findSequelizeType = element => {
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
      return 'BOOLEAN';
    case 'bigint':
      return 'BIGINT';
    case 'double':
      return 'DOUBLE';
    case 'json':
      return 'JSON';
  }
}

/**
 * Enum create
 * @param {*} columnRow 当前字段
 */
const findEnum = columnRow => {
  if (!columnRow.COLUMN_COMMENT) {
    return undefined;
  }
  const regex2 = /\[(.+?)\]/g; // [] 中括号
  const value = columnRow.COLUMN_COMMENT.match(regex2);
  if (!value) {
    return undefined;
  }
  const ee = value[value.length - 1]
    .replace('[', '')
    .replace(']', '')
    .split(',')
    .map(p => {
      const rd3 = p.split(' ');
      const val = rd3[1] ? `= ${rd3[1]}` : '';
      return `  /**
   * ${rd3[2]}
   */
  ${rd3[0]}${val}
  `;
    })
    .join(',')
    .toString();
  const enumTypeName = _.camelCase(columnRow.COLUMN_NAME);
  const txt = `
export enum E${enumTypeName} {
${ee}
}
`;
  const registerEnumType = `registerEnumType(E${enumTypeName}, {
  name: 'E${enumTypeName}',
});
  `;
  return {
    enumTypeName: `E${enumTypeName}`,
    txt,
    registerEnumType
  }
}

/**
 * 字段名常量
 * @param {*} columnRow 当前字段
 */
const findConst = columnRow => {
  return `
  /**
   * ${columnRow.COLUMN_COMMENT}
   */
  static readonly ${_.toUpper(columnRow.COLUMN_NAME)}: string = '${_.camelCase(columnRow.COLUMN_NAME)}';
`;
}

/**
 * field 不设置null
 * @param {*} typeString 
 * @param {*} enumTypeName 
 * @param {*} sequelizeType 
 * @param {*} columnRow 
 */
const findProperty = (typeString, enumTypeName, sequelizeType, columnRow) => {
  // console.log(typeString)
  // console.log(enumTypeName)
  // console.log(JSON.stringify(sequelizeType))
  // console.log(JSON.stringify(columnRow))
  return `
  /**
   * ${columnRow.COLUMN_COMMENT || columnRow.COLUMN_NAME}
   */
  @Column({ comment: '${columnRow.COLUMN_COMMENT}' })
  ${inflect.camelize(columnRow.COLUMN_NAME, false)}?: ${enumTypeName || typeString};
`;
}

/**
 * model file create
 * @param {*} propertyTxt 字段代码片段
 * @param {*} enumTxt 枚举备注
 * @param {*} registerEnumType 枚举代码片段
 * @param {*} constTxt 字段名常量代码片段
 * @param {*} tableItem 数据库表信息object
 */
const modelTemplate = (propertyTxt, enumTxt, registerEnumType, constTxt, tableItem) => {

  return `import { providerWrapper } from 'midway';
import { Table, Column } from 'sequelize-typescript';
import { BaseModel } from '../../base/base.model';

// #region enum${enumTxt}
${registerEnumType}
// #endregion


/** 
 * 字段名常量类
 */
export class Const${inflect.camelize(tableItem.name)} {
  ${constTxt}
}

// 依赖注入用导出类型
export type I${inflect.camelize(tableItem.name)}Model = typeof ${inflect.camelize(tableItem.name)}Model;

@Table({
  tableName: '${tableItem.name}'
})
export class ${inflect.camelize(tableItem.name)}Model extends BaseModel {
${propertyTxt}
}

// @provide 用 工厂模式static model
export const factory = () => ${inflect.camelize(tableItem.name)}Model;
providerWrapper([
  {
    id: '${inflect.camelize(tableItem.name)}Model',
    provider: factory
  }
]);

`;

}

/**
 * 
 * @param {*} mysqlHelper 
 * @param {*} tableItem 
 */
const findmodel = async (columnList, tableItem) => {
  let enumTxt = '', propertyTxt = '', constTxt = '', registerEnumType = '';
  columnList.filter(p => !notColumn.includes(p.COLUMN_NAME)).forEach(p => {
    // columnList.forEach(p => {
    const typeString = findTypeTxt(p);
    const colEnum = findEnum(p);
    enumTxt += _.get(colEnum, 'txt', '');
    registerEnumType += _.get(colEnum, 'registerEnumType', '');
    const sequelizeType = findSequelizeType(p);
    propertyTxt += findProperty(typeString, _.get(colEnum, 'enumTypeName'), sequelizeType, p);
    constTxt += findConst(p);
  });
  return modelTemplate(propertyTxt, enumTxt, registerEnumType, constTxt, tableItem);
}

module.exports = findmodel;