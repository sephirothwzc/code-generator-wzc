/*
 * @Author: zhanchao.wu
 * @Date: 2020-09-16 18:36:37
 * @Last Modified by: zhanchao.wu
 * @Last Modified time: 2020-10-17 16:35:50
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

const findForeignKey = (tableItem, keyColumnList) => {
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
      _.set(_args.param, 'where.${pascalName(p.COLUMN_NAME, false)}', _root.id);
      return service.findAll(_args.param);
    },`;
    }
  }).join(`
`);
  const template = `  ${pascalName(tableItem.name)}: {
${property}
  },`;
  return template;
};

const modelTemplate = (tableItem, keyColumnList) => {
  let foreignKey = findForeignKey(tableItem, keyColumnList);
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
  return modelTemplate(tableItem, keyColumnList);
};

module.exports = findresolver;
