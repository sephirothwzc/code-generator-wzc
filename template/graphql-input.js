/*
 * @Author: zhanchao.wu
 * @Date: 2020-04-09 19:57:34
 * @Last Modified by: zhanchao.wu
 * @Last Modified time: 2020-10-29 15:54:12
 */
const _ = require('lodash');
const pascalName = require('../utils/name-case');

const notColumn = [
  'id',
  'created_at',
  'updated_at',
  'deleted_at',
  'created_user',
  'updated_user',
  'i18n',
];

const gqlTypeMapper = {
  GraphQLJSON: {
    txt: '()=> GraphQLJSON, ',
  },
};
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
      return `Date`;
    case 'boolean':
      return 'boolean';
    case 'json':
      return 'Record<string, any>';
  }
};

const findGqlType = (element) => {
  switch (element.DATA_TYPE) {
    case 'nvarchar':
    case 'varchar':
      return `String`;
    case 'datetime':
      return `Date`;
    case 'timestamp':
    case 'int':
      return `Int`;
    case 'decimal':
      return `Float`;
    case 'boolean':
      return 'Boolean';
    case 'bigint':
      return 'BIGINT';
    case 'double':
      return 'String';
    case 'json':
      return 'GraphQLJSON';
  }
};

const findEnum = (columnRow) => {
  if (!columnRow.COLUMN_COMMENT) {
    return undefined;
  }
  const regex2 = /\[(.+?)\]/g; // [] 中括号
  const value = columnRow.COLUMN_COMMENT.match(regex2);
  if (!value || value === `[unique]`) {
    return undefined;
  }

  const enumTypeName = _.camelCase(columnRow.COLUMN_NAME);
  return {
    enumTypeName: `E${enumTypeName}`,
  };
};

const findProperty = (typeString, enumTypeName, gqlType, columnRow) => {
  const nullable = columnRow.IS_NULLABLE === 'YES' ? ', nullable: true ' : '';
  const gqlTypeTxt = enumTypeName
    ? `()=> ${enumTypeName}, `
    : _.get(gqlTypeMapper, `${gqlType}.txt`, '');
  return `  /**
   * ${columnRow.COLUMN_COMMENT || columnRow.COLUMN_NAME}
   */
  @Field(${gqlTypeTxt}{ description: '${columnRow.COLUMN_COMMENT}'${nullable} })
  ${pascalName(columnRow.COLUMN_NAME, false)}?: ${enumTypeName || typeString};
`;
};

const modelTemplate = (propertyTxt, enumTxt, constTxt, tableItem) => {
  return `import { InputType, Field } from '@nestjs/graphql';
import { BaseInput } from 'src/base/base.input';
// import GraphQLJSON from 'graphql-type-json';

@InputType()
export class ${pascalName(tableItem.name)}Input extends BaseInput {
${propertyTxt}
}
`;
};

/**
 *
 * @param {*} mysqlHelper
 * @param {*} tableItem
 */
const findinput = async (columnList, tableItem) => {
  let enumTxt = '',
    propertyTxt = '',
    constTxt = '';
  columnList
    .filter((p) => !notColumn.includes(p.COLUMN_NAME))
    .forEach((p) => {
      // columnList.forEach(p => {
      const typeString = findTypeTxt(p);
      const colEnum = findEnum(p);
      const gqlType = findGqlType(p);
      propertyTxt += findProperty(typeString, _.get(colEnum, 'enumTypeName'), gqlType, p);
    });
  return modelTemplate(propertyTxt, enumTxt, constTxt, tableItem);
};

module.exports = findinput;
