/*
 * @Author: 王肇峰 
 * @Date: 2020-04-20 14:10:46 
 * @Last Modified by: 王肇峰
 * @Last Modified time: 2020-06-03 14:14:44
 */

const _ = require('lodash');
const inflect = require('i')();

/**
 * 排除的列
 */
const notColumn = [
];

/**
 * mysql字段类型=>TypeScript的类型字符串
 * @param {*} columnRow 传入数据库表的字段对象
 */
const findTypeTxt = columnRow => {
  switch (columnRow.DATA_TYPE) {
    case 'bigint':
    case 'nvarchar':
    case 'varchar':
    case 'text':
      return 'string';
    case 'timestamp':
    case 'int':
    case 'decimal':
    case 'double':
      return `number`;
    case 'datetime':
      return `string`;
    case 'boolean':
      return 'boolean';
    case 'json':
      return 'string';
  }
}
/**
 * mysql字段类型=>sequelize的类型字符串
 * @param {*} columnRow 传入数据库表的字段对象
 */
const findSequelizeType = columnRow => {
  switch (columnRow.DATA_TYPE) {
    case 'nvarchar':
    case 'varchar':
      return `STRING(${columnRow.CHARACTER_MAXIMUM_LENGTH})`;
    case 'text':
      return `TEXT`;
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
 * 根据字段备注内容的预设格式，创建枚举类型
 * @param {*} columnRow 传入数据库表的字段对象
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
      const val = rd3[1] ? `${rd3[1]}` : '';
      return val;
    })
    .join(',')
    .toString();
  return {
    txt: `[${ee}]`
  }
}

/**
 * field 根据数据库表的字段类型及名称，返回TypeScript的类属性
 * @param {*} typeString 
 * @param {*} enumTypeName 
 * @param {*} sequelizeType 
 * @param {*} columnRow 
 */
const findProperty = (typeString, enumTxt, sequelizeType, columnRow) => {
  // console.log(typeString)
  // console.log(enumTypeName)
  // console.log(JSON.stringify(sequelizeType))
  // console.log(JSON.stringify(columnRow))
  let valid = '';
  if (enumTxt) {
    valid = `
    .valid(${enumTxt})`
  }
  return `
  ${inflect.camelize(columnRow.COLUMN_NAME, false)}: joi
    .${typeString}()${valid}
    .description('${columnRow.COLUMN_COMMENT || columnRow.COLUMN_NAME}'),`;
}

/**
 * model 映射文件的内容模板
 * @param {*} propertyTxt 字段代码片段
 * @param {*} tableItem 数据库表信息object
 */
const modelTemplate = (propertyTxt, tableItem) => {
  return `import * as joi from 'joi';

export const S${inflect.camelize(tableItem.name)} = {
${propertyTxt}
}
`;

}

/**
 * 
 * @param {*} mysqlHelper 
 * @param {*} tableItem 
 */
const findSchemasIn = async (columnList, tableItem) => {
  let propertyTxt = '';
  const sequelizeTypeSet = new Set();
  columnList.filter(p => !notColumn.includes(p.COLUMN_NAME)).forEach(p => {
    // columnList.forEach(p => {
    const typeString = findTypeTxt(p);
    const colEnum = findEnum(p);
    const sequelizeType = findSequelizeType(p);
    if (_.startsWith(sequelizeType, 'STRING')) {
      sequelizeTypeSet.add('STRING')
    } else {
      sequelizeTypeSet.add(sequelizeType);
    }
    propertyTxt += findProperty(typeString, _.get(colEnum, 'txt'), sequelizeType, p);
  });
  return modelTemplate(propertyTxt, tableItem);
}

module.exports = findSchemasIn;