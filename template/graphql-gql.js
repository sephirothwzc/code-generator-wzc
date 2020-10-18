/*
 * @Author: zhanchao.wu
 * @Date: 2020-04-09 19:57:34
 * @Last Modified by: zhanchao.wu
 * @Last Modified time: 2020-10-18 11:29:13
 */
// const _ = require('lodash');
const pascalName = require('../utils/name-case');

const notColumn = ['id'];
let enumTxt = '';

const findTypeTxt = (tableName, columnRow) => {
  switch (columnRow.DATA_TYPE) {
    case 'bigint':
    case 'nvarchar':
    case 'varchar':
      return 'String';
    case 'timestamp':
    case 'int':
    case 'decimal':
    case 'double':
      return `Float`;
    case 'datetime':
      return `DateTime`;
    case 'boolean':
    case 'tinyint':
      return 'Boolean';
    case 'json':
      return 'JSONObject';
    case 'enum':
      enumTxt += `
enum E${pascalName(tableName)}${pascalName(columnRow.COLUMN_NAME, true)}${columnRow.COLUMN_TYPE.replace('enum', '').replace(/\(/g, '{').replace(/\)/g, '}').replace(/[']/g, '')}`;
      return `E${pascalName(tableName)}${pascalName(columnRow.COLUMN_NAME, true)}`;
    default:
      return 'String';
  }
};

const findType = (columnList, tableItem, keyColumnList) => {
  const property = columnList
    .filter((p) => !notColumn.includes(p.COLUMN_NAME))
    .map((col) => {
      const comment = col.COLUMN_COMMENT
        ? `  # ${col.COLUMN_COMMENT}
  `
        : '  ';
      return `${comment}${pascalName(col.COLUMN_NAME, false)}: ${findTypeTxt(tableItem.name, col)}`;
    }).join(`
`);
  // 主外键对象
  const foreignKey = findForeignKey(tableItem, keyColumnList) || '';
  const foreignKeyInput = findForeignKeyInput(tableItem, keyColumnList) || '';
  const temp = `# ${tableItem.comment}
type ${pascalName(tableItem.name)} {
  id: ID
${property}${foreignKey}
}
${enumTxt}

extend type Query {
  # ${tableItem.comment} 分页查询
  ${pascalName(tableItem.name, false)}Count(param: QueryListParam): Int
  # ${tableItem.comment}  id 获取
  ${pascalName(tableItem.name, false)}(id: ID!): ${pascalName(tableItem.name)}
  # ${tableItem.comment} 有条件返回
  ${pascalName(tableItem.name, false)}List(param: QueryListParam): [${pascalName(tableItem.name)}]
}

extend type Mutation {
  # ${tableItem.comment} 新增 or 修改
  ${pascalName(tableItem.name, false)}(param: ${pascalName(tableItem.name)}SaveIn!, must: Boolean = false): String
  # ${tableItem.comment} 批量 新增 or 修改
  ${pascalName(tableItem.name, false)}Bulk(param: [${pascalName(tableItem.name)}SaveIn]!): [JSONObject]
  # ${tableItem.comment} 删除
  ${pascalName(tableItem.name, false)}Destroy(where: JSONObject!, limit: Int): String
}

input ${pascalName(tableItem.name)}SaveIn {
  id: ID
${property}${foreignKeyInput}
}
`;
  return temp;
};

const findForeignKey = (tableItem, keyColumnList) => {
  // @Field({ description: '编码', nullable: true })
  return keyColumnList
    .map((p) => {
      if (p.TABLE_NAME === tableItem.name) {
        // 子表 外键 BelongsTo 1 v 1
        return `
  ${pascalName(p.COLUMN_NAME, false)}Obj: ${pascalName(p.REFERENCED_TABLE_NAME)}`;
      } else {
        // 主表 主键 Hasmany 1 v N
        return `
  ${pascalName(p.TABLE_NAME, false)}${pascalName(p.COLUMN_NAME)}(param: QueryListParam): [${pascalName(p.TABLE_NAME)}]`;
      }
    })
    .join('');
};

/**
 * 根据key生成主外建对象
 * @param {*} typeString
 * @param {*} enumTypeName
 * @param {*} sequelizeType
 * @param {*} columnRow
 */
const findForeignKeyInput = (tableItem, keyColumnList) => {
  // @Field({ description: '编码', nullable: true })
  return keyColumnList
    .filter((p) => p.REFERENCED_TABLE_NAME === tableItem.name)
    .map((p) => {
      // 主表 主键 Hasmany 1 v N
      return `
  ${pascalName(p.TABLE_NAME, false)}: [${pascalName(p.TABLE_NAME)}SaveIn]`;
    })
    .join('');
};

/**
 *
 * @param {*} mysqlHelper
 * @param {*} tableItem
 */
const findgraphql = (columnList, tableItem, keyColumnList) => {
  enumTxt = '';
  const modelType = findType(columnList, tableItem, keyColumnList);
  return modelType;
};

module.exports = findgraphql;
