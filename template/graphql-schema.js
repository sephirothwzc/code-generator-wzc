/*
 * @Author: zhanchao.wu
 * @Date: 2020-04-09 19:57:34
 * @Last Modified by: zhanchao.wu
 * @Last Modified time: 2020-10-17 13:56:06
 */

// const _ = require('lodash');
const inflect = require('i')();

const notColumn = ['id'];

const findTypeTxt = (columnRow) => {
  switch (columnRow.DATA_TYPE) {
    case 'bigint':
    case 'nvarchar':
    case 'varchar':
      return 'Joi.string()';
    case 'timestamp':
    case 'int':
    case 'decimal':
    case 'double':
      return `Joi.number()`;
    case 'datetime':
      return `Joi.string()`;
    case 'boolean':
    case 'tinyint':
      return 'Joi.boolean()';
    case 'json':
      return 'Joi.string()';
    case 'enum':
      return `Joi.string().valid${columnRow.COLUMN_TYPE.replace('enum', '')}`;
    default:
      return 'Joi.string()';
  }
};

const findType = (columnList, tableItem) => {
  const property = columnList
    .filter((p) => !notColumn.includes(p.COLUMN_NAME))
    .map((col) => {
      return `  ${inflect.camelize(col.COLUMN_NAME, false)}: ${findTypeTxt(col)}.description('${col.COLUMN_COMMENT}'),`;
    }).join(`
`);
  // 主外键对象
  // const foreignKey = findForeignKey(tableItem, keyColumnList) || '';
  // const foreignKeyImport = findForeignKeyImport(tableItem, keyColumnList) || '';
  const temp = `import * as Joi from 'joi';

// #region Graphql
export const ${inflect.camelize(tableItem.name, false)}MutationCreate = Joi.object().keys({
${property}
});

export const ${inflect.camelize(tableItem.name, false)}MutationUpdate = Joi.object().keys({
${property}
});

export const ${inflect.camelize(tableItem.name, false)}BulkMutation = Joi.array().items(${inflect.camelize(tableItem.name, false)}MutationCreate);
// #endregion
`;
  return temp;
};

// const findForeignKey = (tableItem, keyColumnList) => {
//   // @Field({ description: '编码', nullable: true })
//   return keyColumnList.map((p) => {
//     if (p.TABLE_NAME === tableItem.name) {
//       // 子表 外键 BelongsTo 1 v 1
//       return `  ${inflect.camelize(p.COLUMN_NAME, false)}Obj: ${inflect.camelize(p.REFERENCED_TABLE_NAME, false)}MutationCreate,`;
//     } else {
//       // 主表 主键 Hasmany 1 v N
//       return `  ${inflect.camelize(p.TABLE_NAME, false)}: Joi.array().items(${inflect.camelize(p.TABLE_NAME, false)}MutationCreate),`;
//     }
//   }).join(`
// `);
// };

// /**
//  * 根据key生成主外建对象
//  * @param {*} typeString
//  * @param {*} enumTypeName
//  * @param {*} sequelizeType
//  * @param {*} columnRow
//  */
// const findForeignKeyImport = (tableItem, keyColumnList) => {
//   // @Field({ description: '编码', nullable: true })
//   return keyColumnList
//     .filter((p) => p.REFERENCED_TABLE_NAME === tableItem.name)
//     .map((p) => {
//       // 主表 主键 Hasmany 1 v N
//       return `import { ${inflect.camelize(p.TABLE_NAME, false)}MutationCreate } from './${p.TABLE_NAME.replace(/_/g, '-')}.schema';`;
//     }).join(`
// `);
// };

/**
 *
 * @param {*} mysqlHelper
 * @param {*} tableItem
 */
const findschema = (columnList, tableItem, keyColumnList) => {
  const modelType = findType(columnList, tableItem, keyColumnList);
  return modelType;
};

module.exports = findschema;
