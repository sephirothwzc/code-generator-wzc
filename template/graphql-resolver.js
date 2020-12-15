/*
 * @Author: zhanchao.wu
 * @Date: 2020-09-16 18:36:37
 * @Last Modified by: zhanchao.wu
 * @Last Modified time: 2020-12-15 22:39:36
 */
const _ = require('lodash');
const pascalName = require('../utils/name-case');

/**
 * 
 * RowDataPacket {
    TABLE_SCHEMA: 'integral_recycling_dev',
    REFERENCED_TABLE_NAME: 'goods_type',
    REFERENCED_COLUMN_NAME: 'id',
    TABLE_NAME: 'goods',
    COLUMN_NAME: 'goods_type_id',
    CONSTRAINT_NAME: 'goods_ibfk_1',
    TABLE_COMMENT: '商品信息',
    UPDATE_RULE: 'NO ACTION',
    DELETE_RULE: 'NO ACTION'
  },
 */

const findForeignKey = (tableItem, keyColumnList, columnList) => {
  // @Field({ description: '编码', nullable: true })
  const property = keyColumnList.map((p) => {
    if (p.TABLE_NAME === tableItem.name) {
      // 子表 外键 BelongsTo 1 v 1
      return `    ${pascalName(p.COLUMN_NAME, false)}Obj: async (_root, _args, ctx, _info) => {
      const service = await getService(ctx,'${pascalName(p.REFERENCED_TABLE_NAME, false)}');
      return service.fetchById(_root.${pascalName(p.COLUMN_NAME, false)});
    },`;
    } else {
      // 主表 主键 Hasmany 1 v N
      return `    ${pascalName(p.TABLE_NAME, false)}${pascalName(p.COLUMN_NAME)}: async (_root, _args, ctx, _info) => {
      const service = await getService(ctx, '${pascalName(p.TABLE_NAME, false)}');
      _.set(_args, 'param.where.${pascalName(p.COLUMN_NAME, false)}', _root.id);
      return service.findAll(_args.param);
    },`;
    }
  }).join(`
`);
  const objList = addObjByCommit(columnList);
  const template = `  ${pascalName(tableItem.name)}: {
${property}${objList}
  },`;
  return template;
};

const modelTemplate = (tableItem, keyColumnList, columnList) => {
  let foreignKey = findForeignKey(tableItem, keyColumnList, columnList);
  const imputlodash = foreignKey
    ? `const _ = require('lodash');
`
    : '';
  foreignKey &&
    (foreignKey = `
${foreignKey}`);
  return `const resolverUtil = require('../utils/resolver.util');
const { Query, Mutation, getService } = resolverUtil('${_.camelCase(tableItem.name)}');
${imputlodash}
module.exports = {
  Query,
  Mutation,${foreignKey}
};
`;
};

/**
 *
 * @param {*} mysqlHelper
 * @param {*} tableItem
 */
const findresolver = async (columnList, tableItem, keyColumnList) => {
  return modelTemplate(tableItem, keyColumnList, columnList);
};

/**
 * 根据每一列的备注判断 是否需要增加 obj {appUser}
 * @param {*} columnList
 */
const addObjByCommit = (columnList) => {
  return columnList
    .filter((p) => p.COLUMN_COMMENT.match(/{(.+?)}/g))
    .map((p) => {
      const value = p.COLUMN_COMMENT.match(/{(.+?)}/g);
      const txt = value[value.length - 1].replace('{', '').replace('}', '');
      return `    /**
     * ${p.COLUMN_COMMENT}
     */
    ${pascalName(p.COLUMN_NAME, false)}Obj: async (_root, _args, ctx, _info) => {
      if (!_root || !_root.${pascalName(p.COLUMN_NAME, false)}) {
        return null;
      }
      const service = await getService(ctx, '${pascalName(txt, false)}');
      return service.fetchById(_root.${pascalName(p.COLUMN_NAME, false)});
    },`;
    }).join(`
`);
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

module.exports = findresolver;
