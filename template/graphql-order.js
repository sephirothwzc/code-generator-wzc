/*
 * @Author: zhanchao.wu
 * @Date: 2020-04-09 19:57:34
 * @Last Modified by: zhanchao.wu
 * @Last Modified time: 2020-04-30 18:35:14
 */
// const _ = require('lodash');
const pascalName = require('../utils/name-case');

const modelTemplate = (propertyTxt, tableItem) => {
  return `import { ModelOrder } from '../common/model-order';
import { registerEnumType, Field, InputType } from '@nestjs/graphql';

export enum ${pascalName(tableItem.name)}OrderField {
${propertyTxt}
}
registerEnumType(${pascalName(tableItem.name)}OrderField, {
  name: '${pascalName(tableItem.name)}OrderField',
  description: 'Properties by which ${pascalName(tableItem.name)} connections can be ordered.'
});

@InputType()
export class ${pascalName(tableItem.name)}Order extends ModelOrder {
  @Field(() => ${pascalName(tableItem.name)}OrderField)
  field: ${pascalName(tableItem.name)}OrderField;
}
`;
};

/**
 *
 * @param {*} mysqlHelper
 * @param {*} tableItem
 */
const findorder = async (columnList, tableItem) => {
  const propertyTxt = columnList.map((p) => `  ${pascalName(p.COLUMN_NAME, false)} = '${pascalName(p.COLUMN_NAME, false)}'`).join(`,
`);
  return modelTemplate(propertyTxt, tableItem);
};

module.exports = findorder;
