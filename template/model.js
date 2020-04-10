/*
 * @Author: zhanchao.wu
 * @Date: 2020-04-09 19:57:34
 * @Last Modified by: zhanchao.wu
 * @Last Modified time: 2020-04-10 09:52:12
 */
const _ = require('lodash');
const inflect = require('i')();

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
      return `
  /**
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
  return {
    enumTypeName,
    txt
  }
}

const findProperty = (typeString, enumTypeName, sequelizeType, columnRow) => {
  return `
  /**
   * ${columnRow.COLUMN_COMMENT || columnRow.COLUMN_NAME}
   */
  @Field(${columnRow.DATA_TYPE === 'json' ? '()=> GraphQLJSON, ' : ''}{ description: '${columnRow.COLUMN_COMMENT}' })
  @Column({ comment: '${columnRow.COLUMN_COMMENT}', type: DataType.${sequelizeType} })
  ${_.camelCase(columnRow.COLUMN_NAME)}?: ${enumTypeName || typeString};
`;
}

const modelTemplate = (propertyTxt, enumTxt, constTxt, tableItem) => {
  return `
import { Table, Column, DataType } from 'sequelize-typescript';
import { ModelBase } from 'libs/base/src/model.base';
import { ArgsType, ObjectType, Field } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

// #region enum${enumTxt}
// #endregion

@ArgsType()
@ObjectType({description:'${tableItem.comment}'})
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
const findModel = async (mysqlHelper, tableItem) => {
  const columnList = await mysqlHelper.queryColumn(tableItem.name);
  let enumTxt = '', propertyTxt = '', constTxt = '';
  columnList.forEach(p => {
    const typeString = findTypeTxt(p);
    const colEnum = findEnum(p);
    enumTxt += _.get(colEnum, 'txt', '');
    const sequelizeType = findSequelizeType(p);
    propertyTxt += findProperty(typeString, _.get(colEnum, 'enumTypeName'), sequelizeType, p);
    constTxt += `
  /**
   * ${p.COLUMN_COMMENT}
   */
  static readonly ${_.toUpper(p.COLUMN_NAME)}: string = '${_.camelCase(p.COLUMN_NAME)}';
`
  });
  return modelTemplate(propertyTxt, enumTxt, constTxt, tableItem);
}

module.exports = findModel;