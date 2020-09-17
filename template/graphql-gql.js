/*
 * @Author: zhanchao.wu
 * @Date: 2020-04-09 19:57:34
 * @Last Modified by: zhanchao.wu
 * @Last Modified time: 2020-09-17 10:00:52
 */
// const _ = require('lodash');
const inflect = require('i')();

const notColumn = ['id'];
let enumTxt = '';

const findTypeTxt = (columnRow) => {
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
      return `Date`;
    case 'boolean':
    case 'tinyint':
      return 'Boolean';
    case 'json':
      return 'JSONObject';
    case 'enum':
      enumTxt += `
enum E${inflect.camelize(columnRow.COLUMN_NAME, true)}${columnRow.COLUMN_TYPE.replace('enum', '').replace(/\(/g, '{').replace(/\)/g, '}').replace(/[']/g, '')}`;
      return `E${inflect.camelize(columnRow.COLUMN_NAME, true)}`;
    default:
      return 'String';
  }
};

const findType = (columnList, tableItem) => {
  const property = columnList
    .filter((p) => !notColumn.includes(p.COLUMN_NAME))
    .map((col) => {
      const comment = col.COLUMN_COMMENT
        ? `  # ${col.COLUMN_COMMENT}
  `
        : '  ';
      return `${comment}${inflect.camelize(col.COLUMN_NAME, false)}: ${findTypeTxt(col)}`;
    }).join(`
`);
  const temp = `# ${tableItem.comment}
type ${inflect.camelize(tableItem.name)} {
  id: ID
${property}
}
${enumTxt}

# ${tableItem.comment} 分页查询返回
type ${inflect.camelize(tableItem.name)}List {
  count: Int!
  list: [${inflect.camelize(tableItem.name)}]
}

extend type Query {
  # ${tableItem.comment} 分页查询
  ${inflect.camelize(tableItem.name, false)}List(param: QueryListParam): ${inflect.camelize(tableItem.name)}List
  # ${tableItem.comment}  id 获取
  ${inflect.camelize(tableItem.name, false)}(id: ID!): ${inflect.camelize(tableItem.name)}
  # ${tableItem.comment} 有条件返回
  ${inflect.camelize(tableItem.name, false)}All(param: QueryListParam): [${inflect.camelize(tableItem.name)}]
}

extend type Mutation {
  # ${tableItem.comment} 新增 or 修改
  ${inflect.camelize(tableItem.name, false)}(param: ${inflect.camelize(tableItem.name)}SaveIn!): String
  # ${tableItem.comment} 批量 新增 or 修改
  ${inflect.camelize(tableItem.name, false)}Bulk(param: [${inflect.camelize(tableItem.name)}SaveIn]!): String
  # ${tableItem.comment} 删除
  ${inflect.camelize(tableItem.name, false)}Destroy(where: JSONObject!, limit: Int): String
}

input ${inflect.camelize(tableItem.name)}SaveIn {
  id: ID
${property}
}
`;
  return temp;
};

/**
 *
 * @param {*} mysqlHelper
 * @param {*} tableItem
 */
const findgraphql = (columnList, tableItem) => {
  enumTxt = '';
  const modelType = findType(columnList, tableItem);
  return modelType;
};

module.exports = findgraphql;
