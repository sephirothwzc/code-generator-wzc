/*
 * @Author: zhanchao.wu
 * @Date: 2020-04-09 19:57:34
 * @Last Modified by: zhanchao.wu
 * @Last Modified time: 2020-09-17 19:33:13
 */
const _ = require('lodash');
const inflect = require('i')();
// 是否添加引用
let importHasMany = false;
let importBelongsTo = false;
let txtImport = new Set();

const notColumn = ['id', 'created_at', 'updated_at', 'deleted_at', 'created_user', 'updated_user', 'created_id', 'updated_id', 'deleted_id', 'code', 'i18n'];

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
    case 'tinyint':
      return 'boolean';
    case 'json':
      return 'Record<string, any>';
    default:
      return 'string';
  }
};

const findSequelizeType = (element) => {
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
    case 'tinyint':
      return 'BOOLEAN';
    case 'bigint':
      return 'BIGINT';
    case 'double':
      return 'DOUBLE';
    case 'json':
      return 'JSON';
    case 'mediumtext':
      return `TEXT('mediumtext')`;
    case 'multilinestring':
      return `TEXT('multilinestring')`;
    case 'text':
      return 'TEXT';
    case 'tinytext':
      return `TEXT('tinytext')`;
    case 'enum':
      return element.COLUMN_TYPE.replace('enum', 'ENUM');
  }
};

/**
 * comment [info 1 初始化,close 0 关闭] or [info 初始化,close 关闭]or [info,close]
 * @param {*} columnRow 行
 */
const findEnum = (columnRow) => {
  let value;
  if (!columnRow.COLUMN_COMMENT && columnRow.DATA_TYPE !== 'enum') {
    return undefined;
  }
  if (columnRow.COLUMN_COMMENT) {
    const regex2 = /\[(.+?)\]/g; // [] 中括号
    value = columnRow.COLUMN_COMMENT.match(regex2);
    if (value) {
      value = value[value.length - 1].replace('[', '').replace(']', '');
    }
  }
  if (columnRow.DATA_TYPE === 'enum' && !value) {
    value = columnRow.COLUMN_TYPE.replace('enum', '').replace(/[()']/g, '');
  }
  if (!value) {
    return undefined;
  }
  const ee = value
    .split(/[,，]/)
    .map((p) => {
      const rd3 = p.split(' ');
      if (rd3.length === 3) {
        const val = rd3[1] ? ` = '${rd3[1]}'` : '';
        return `  /**
   * ${rd3[2]}
   */
  ${rd3[0]}${val},
`;
      } else if (rd3.length === 2) {
        return `  /**
   * ${rd3[1]}
   */
  ${rd3[0]} = '${rd3[0]}',
`;
      } else {
        return `  /**
   *
   */
  ${rd3[0]} = '${rd3[0]}',
`;
      }
    })
    .join('');
  const enumTypeName = inflect.camelize(columnRow.COLUMN_NAME);
  const txt = `
export enum E${enumTypeName} {
${ee}
}
`;

  return {
    enumTypeName: `E${enumTypeName}`,
    txt,
  };
};

/**
 * field 不设置null
 * @param {*} typeString
 * @param {*} enumTypeName
 * @param {*} sequelizeType
 * @param {*} columnRow
 */
const findProperty = (typeString, enumTypeName, sequelizeType, columnRow, keyColumnList, tableItem) => {
  const nullable = columnRow.IS_NULLABLE === 'YES' ? '?' : '';
  const foreignKey = keyColumnList.find((p) => p.TABLE_NAME === tableItem.name && p.COLUMN_NAME === columnRow.COLUMN_NAME);
  const foreignKeyTxt = foreignKey
    ? `
  @ForeignKey(() => ${inflect.camelize(foreignKey.REFERENCED_TABLE_NAME)}Model)`
    : '';
  // @Field({ description: '编码', nullable: true })
  return `  /**
   * ${columnRow.COLUMN_COMMENT || columnRow.COLUMN_NAME}
   */${foreignKeyTxt}
  @Column({ comment: '${columnRow.COLUMN_COMMENT}', type: DataType.${sequelizeType} })
  ${inflect.camelize(columnRow.COLUMN_NAME, false)}${nullable}: ${enumTypeName || typeString};
`;
};

/**
 * 根据key生成主外建对象 增加 import
 * @param {*} typeString
 * @param {*} enumTypeName
 * @param {*} sequelizeType
 * @param {*} columnRow
 */
const findForeignKey = (tableItem, keyColumnList) => {
  // @Field({ description: '编码', nullable: true })
  return keyColumnList
    .map((p) => {
      if (p.TABLE_NAME === tableItem.name) {
        txtImport.add(`import { ${inflect.camelize(p.REFERENCED_TABLE_NAME)}Model } from './${p.REFERENCED_TABLE_NAME.replace(/_/g, '-')}.model';`);
        importBelongsTo = true;
        // 子表 外键 BelongsTo
        return `
  @BelongsTo(() => ${inflect.camelize(p.REFERENCED_TABLE_NAME)}Model)
  ${inflect.camelize(p.REFERENCED_TABLE_NAME, false)}: ${inflect.camelize(p.REFERENCED_TABLE_NAME)}Model;
`;
      } else {
        txtImport.add(`import { ${inflect.camelize(p.TABLE_NAME)}Model } from './${p.TABLE_NAME.replace(/_/g, '-')}.model';`);
        importHasMany = true;
        // 主表 主键 Hasmany
        return `
  @HasMany(() => ${inflect.camelize(p.TABLE_NAME)}Model)
  ${inflect.camelize(p.TABLE_NAME, false)}: Array<${inflect.camelize(p.TABLE_NAME)}Model>;
`;
      }
    })
    .join('');
};

const modelTemplate = (propertyTxt, enumTxt, registerEnumType, constTxt, tableItem, keyColums) => {
  const importSequelizeTypescript = `${importBelongsTo ? ', BelongsTo, ForeignKey' : ''}${importHasMany ? ', HasMany' : ''}`;
  return `import { Table, Column, DataType${importSequelizeTypescript} } from 'sequelize-typescript';
import { BaseModel } from '../base/model.base';
import { providerWrapper } from 'midway';
${Array.from(txtImport).join(`
`)}

// #region enum${enumTxt}
${registerEnumType}
// #endregion

// 依赖注入 导出类型
export type I${inflect.camelize(tableItem.name)}Model = typeof ${inflect.camelize(tableItem.name)}Model;

@Table({
  tableName: '${tableItem.name}',
  comment: '${tableItem.comment}',
})
export class ${inflect.camelize(tableItem.name)}Model extends BaseModel {
${propertyTxt}${keyColums}
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
export class ${_.toUpper(tableItem.name)} {
${constTxt}
}

// @provide 用 工厂模式static model
export const factory = () => ${inflect.camelize(tableItem.name)}Model;
providerWrapper([
  {
    id: '${_.camelCase(tableItem.name)}Model',
    provider: factory,
  },
]);
`;
};

/**
 *
 * @param {*} mysqlHelper
 * @param {*} tableItem
 */
const findSequelizeModel = async (columnList, tableItem, keyColumnList) => {
  txtImport = new Set();
  importHasMany = false;
  importBelongsTo = false;
  let enumTxt = '',
    propertyTxt = '',
    constTxt = '',
    registerEnumType = '',
    keyColums = '';
  columnList
    .filter((p) => !notColumn.includes(p.COLUMN_NAME))
    .forEach((p) => {
      // columnList.forEach(p => {
      keyColums = findForeignKey(tableItem, keyColumnList);
      const typeString = findTypeTxt(p);
      const colEnum = findEnum(p);
      enumTxt += _.get(colEnum, 'txt', '');
      registerEnumType += _.get(colEnum, 'registerEnumType', '');
      const sequelizeType = findSequelizeType(p);
      propertyTxt += findProperty(typeString, _.get(colEnum, 'enumTypeName'), sequelizeType, p, keyColumnList, tableItem);
      constTxt += `
  /**
   * ${p.COLUMN_COMMENT}
   */
  static readonly ${_.toUpper(p.COLUMN_NAME)}: string = '${_.camelCase(p.COLUMN_NAME)}';
`;
    });
  return modelTemplate(propertyTxt, enumTxt, registerEnumType, constTxt, tableItem, keyColums);
};

module.exports = findSequelizeModel;
