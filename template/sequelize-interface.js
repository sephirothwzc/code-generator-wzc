/*
 * @Author: 王肇峰 
 * @Date: 2020-04-20 14:10:46 
 * @Last Modified by: 王肇峰
 * @Last Modified time: 2020-06-03 10:11:10
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
      return `Date`;
    case 'boolean':
      return 'boolean';
    case 'json':
      return 'Record<string, any>';
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
 * 根据字段备注内容的预设格式，返回枚举名称
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
  const enumTypeName = inflect.camelize(columnRow.COLUMN_NAME, true);
  return {
    enumTypeName: `E${enumTypeName}`
  }
}

/**
 * 字段名常量
 * @param {*} columnRow 传入数据库表的字段对象
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
 * field 根据数据库表的字段类型及名称，返回TypeScript的类属性
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
  ${inflect.camelize(columnRow.COLUMN_NAME, false)}: ${enumTypeName || typeString};
`;
}

/**
 * model 映射文件的内容模板
 * @param {*} propertyTxt 字段代码片段
 * @param {*} enumTxt 枚举备注
 * @param {*} registerEnumType 枚举代码片段
 * @param {*} constTxt 字段名常量代码片段
 * @param {*} tableItem 数据库表信息object
 */
const modelTemplate = (propertyTxt, enumTxt, constTxt, tableItem) => {
  const filename = tableItem.name.replace(/_/g, '-');
  // 如果有枚举，则需要使用INTEGER类型，添加导入代码
  let importType = '';
  if (enumTxt.length > 0) {
    importType = `import { ${enumTxt.join(', ')} } from '../models/${filename}.model';`
  }
  return `
${importType}

export interface I${inflect.camelize(tableItem.name)} {
${propertyTxt}
}
`;

}

/**
 * 
 * @param {*} mysqlHelper 
 * @param {*} tableItem 
 */
const findInterface = async (columnList, tableItem) => {
  let enumTxt = [], propertyTxt = '', constTxt = '';
  const sequelizeTypeSet = new Set();
  columnList.filter(p => !notColumn.includes(p.COLUMN_NAME)).forEach(p => {
    // columnList.forEach(p => {
    const typeString = findTypeTxt(p);
    const colEnum = findEnum(p);
    if (colEnum) {
      enumTxt.push(colEnum.enumTypeName);
    }
    const sequelizeType = findSequelizeType(p);
    if (_.startsWith(sequelizeType, 'STRING')) {
      sequelizeTypeSet.add('STRING')
    } else {
      sequelizeTypeSet.add(sequelizeType);
    }
    propertyTxt += findProperty(typeString, _.get(colEnum, 'enumTypeName'), sequelizeType, p);
    constTxt += findConst(p);
  });
  return modelTemplate(propertyTxt, enumTxt, constTxt, tableItem);
}

module.exports = findInterface;