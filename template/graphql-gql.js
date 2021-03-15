/*
 * @Author: zhanchao.wu
 * @Date: 2020-04-09 19:57:34
 * @Last Modified by: zhanchao.wu
 * @Last Modified time: 2020-12-15 11:43:17
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
enum E${pascalName(tableName)}${pascalName(
        columnRow.COLUMN_NAME,
        true
      )}${columnRow.COLUMN_TYPE.replace('enum', '')
        .replace(/\(/g, '{')
        .replace(/\)/g, '}')
        .replace(/[']/g, '')}`;
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
  // 自定义外键对象
  const objList = addObjByCommit(columnList);

  const temp = `# ${tableItem.comment}
type ${pascalName(tableItem.name)} {
  id: ID
${property}${foreignKey}${objList}
}
${enumTxt}

# ${tableItem.comment} 分页查询返回
type ${pascalName(tableItem.name)}List {
  count: Int!
  list: [${pascalName(tableItem.name)}]
}

extend type Query {
  # ${tableItem.comment} 总行数
  ${pascalName(tableItem.name, false)}Count(param: QueryListParam): Int
  # ${tableItem.comment} 分页查询
  ${pascalName(tableItem.name, false)}List(param: QueryListParam): ${pascalName(tableItem.name)}List
  # ${tableItem.comment}  id 获取
  ${pascalName(tableItem.name, false)}(id: ID!): ${pascalName(tableItem.name)}
  # ${tableItem.comment} 有条件返回
  ${pascalName(tableItem.name, false)}All(param: QueryListParam): [${pascalName(tableItem.name)}]
}

extend type Mutation {
  # ${tableItem.comment} 新增 or 修改
  ${pascalName(tableItem.name, false)}(param: ${pascalName(
    tableItem.name
  )}SaveIn!, must: Boolean = false): String
  # ${tableItem.comment} 批量 新增 or 修改
  ${pascalName(tableItem.name, false)}Bulk(param: [${pascalName(
    tableItem.name
  )}SaveIn]!): [JSONObject]
  # ${tableItem.comment} 删除
  ${pascalName(tableItem.name, false)}Destroy(where: JSONObject!, limit: Int): String
  # ${tableItem.comment} 根据id删除
  ${pascalName(tableItem.name, false)}rDestroyById(id:String): String
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
  ${pascalName(p.TABLE_NAME, false)}${pascalName(
          p.COLUMN_NAME
        )}(param: QueryListParam): [${pascalName(p.TABLE_NAME)}]`;
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
  ${pascalName(p.TABLE_NAME, false)}${pascalName(p.COLUMN_NAME)}: [${pascalName(
        p.TABLE_NAME
      )}SaveIn]`;
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

/**
 * 根据每一列的备注判断 是否需要增加 obj {appUser}
 * @param {*} columnList
 */
const addObjByCommit = (columnList) => {
  const propertyString = columnList
    .filter((p) => p.COLUMN_COMMENT.match(/{(.+?)}/g))
    .map((p) => {
      const value = p.COLUMN_COMMENT.match(/{(.+?)}/g);
      const txt = value[value.length - 1].replace('{', '').replace('}', '');
      return `  # ${p.COLUMN_COMMENT}
  ${pascalName(p.COLUMN_NAME, false)}Obj: ${pascalName(txt)}`;
    }).join(`
`);
  return (
    propertyString &&
    `
${propertyString}`
  );
  /**
   * RowDataPacket {
    TABLE_CATALOG: 'def',
    TABLE_SCHEMA: 'refined_platform_dev',
    TABLE_NAME: 'app_user_details',
    COLUMN_NAME: 'created_at',
    ORDINAL_POSITION: 2,
    COLUMN_DEFAULT: 'CURRENT_TIMESTAMP',
    IS_NULLABLE: 'NO',
    DATA_TYPE: 'datetime',
    CHARACTER_MAXIMUM_LENGTH: null,
    CHARACTER_OCTET_LENGTH: null,
    NUMERIC_PRECISION: null,
    NUMERIC_SCALE: null,
    DATETIME_PRECISION: 0,
    CHARACTER_SET_NAME: null,
    COLLATION_NAME: null,
    COLUMN_TYPE: 'datetime',
    COLUMN_KEY: '',
    EXTRA: 'DEFAULT_GENERATED',
    PRIVILEGES: 'select,insert,update,references',
    COLUMN_COMMENT: '创建时间',
    GENERATION_EXPRESSION: '',
    SRS_ID: null
  }
   */
};

module.exports = findgraphql;
