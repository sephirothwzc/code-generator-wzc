/*
 * @Author: zhanchao.wu
 * @Date: 2020-04-09 19:57:34
 * @Last Modified by: zhanchao.wu
 * @Last Modified time: 2020-04-19 11:41:10
 */
const _ = require('lodash');
const inflect = require('i')();

// const notColumn = [
//   'id',
//   'created_at',
//   'updated_at',
//   'deleted_at',
// ];

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
 * field 不设置null
 * @param {*} typeString 
 * @param {*} enumTypeName 
 * @param {*} sequelizeType 
 * @param {*} columnRow 
 */
const findProperty = (typeString, enumTypeName, sequelizeType, columnRow) => {
  // @Field({ description: '编码', nullable: true })
  return `  /**
   * ${columnRow.COLUMN_COMMENT || columnRow.COLUMN_NAME}
   */
  @Field(${columnRow.DATA_TYPE === 'json' ? '()=> GraphQLJSON, ' : ''}{ description: '${columnRow.COLUMN_COMMENT}' })
  @Column({ comment: '${columnRow.COLUMN_COMMENT}', type: DataType.${sequelizeType} })
  ${inflect.camelize(columnRow.COLUMN_NAME, false)}?: ${enumTypeName || typeString};
`;
}

const modelTemplate = (propertyTxt, enumTxt, registerEnumType, constTxt, tableItem) => {
  return `import { Table, Column, DataType } from 'sequelize-typescript';
import { ModelBase } from 'libs/base/src/model.base';
import { ObjectType, Field } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

// #region enum${enumTxt}
${registerEnumType}
// #endregion

@ObjectType({ description: '${tableItem.comment}' })
@Table({
  tableName: '${tableItem.name}',
})
export class ${inflect.camelize(tableItem.name)}Model extends ModelBase {
${propertyTxt}
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
export class ${_.toUpper(tableItem.name)} {
${constTxt}
}
`;

}

/**
 * 
 * @param {*} mysqlHelper 
 * @param {*} tableItem 
 */
const findmodel = async (columnList, tableItem) => {
  let enumTxt = '', propertyTxt = '', constTxt = '', registerEnumType = '';
  // columnList.filter(p => !notColumn.includes(p.COLUMN_NAME)).forEach(p => {
  columnList.forEach(p => {
    const typeString = findTypeTxt(p);
    const colEnum = findEnum(p);
    enumTxt += _.get(colEnum, 'txt', '');
    registerEnumType += _.get(colEnum, 'registerEnumType', '');
    const sequelizeType = findSequelizeType(p);
    propertyTxt += findProperty(typeString, _.get(colEnum, 'enumTypeName'), sequelizeType, p);
    constTxt += `
  /**
   * ${p.COLUMN_COMMENT}
   */
  static readonly ${_.toUpper(p.COLUMN_NAME)}: string = '${_.camelCase(p.COLUMN_NAME)}';
`
  });
  return modelTemplate(propertyTxt, enumTxt, registerEnumType, constTxt, tableItem);
}

module.exports = findmodel;