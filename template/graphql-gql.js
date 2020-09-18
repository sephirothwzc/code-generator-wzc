/*
 * @Author: zhanchao.wu
 * @Date: 2020-04-09 19:57:34
 * @Last Modified by: zhanchao.wu
 * @Last Modified time: 2020-09-18 10:21:31
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
      return `String`;
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

const findType = (columnList, tableItem, keyColumnList) => {
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
  // 主外键对象
  const foreignKey = findForeignKey(tableItem, keyColumnList) || '';
  const foreignKeyInput = findForeignKeyInput(tableItem, keyColumnList) || '';
  const temp = `# ${tableItem.comment}
type ${inflect.camelize(tableItem.name)} {
  id: ID
${property}${foreignKey}
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
  ${inflect.camelize(p.COLUMN_NAME, false)}Obj: ${inflect.camelize(p.REFERENCED_TABLE_NAME)}`;
      } else {
        // 主表 主键 Hasmany 1 v N
        return `
  ${inflect.camelize(p.TABLE_NAME, false)}: [${inflect.camelize(p.TABLE_NAME)}]`;
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
  ${inflect.camelize(p.TABLE_NAME, false)}: [${inflect.camelize(p.TABLE_NAME)}SaveIn]`;
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
