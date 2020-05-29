/*
 * @Author: zhanchao.wu
 * @Date: 2020-04-09 19:57:34
 * @Last Modified by: zhanchao.wu
 * @Last Modified time: 2020-04-30 18:35:14
 */
// const _ = require('lodash');
const inflect = require('i')();

const modelTemplate = (propertyTxt, tableItem) => {
  return `import { ModelOrder } from '../common/model-order';
import { registerEnumType, Field, InputType } from '@nestjs/graphql';

export enum ${inflect.camelize(tableItem.name)}OrderField {
${propertyTxt}
}
registerEnumType(${inflect.camelize(tableItem.name)}OrderField, {
  name: '${inflect.camelize(tableItem.name)}OrderField',
  description: 'Properties by which ${inflect.camelize(tableItem.name)} connections can be ordered.'
});

@InputType()
export class ${inflect.camelize(tableItem.name)}Order extends ModelOrder {
  @Field(() => ${inflect.camelize(tableItem.name)}OrderField)
  field: ${inflect.camelize(tableItem.name)}OrderField;
}
`;

}

/**
 * 
 * @param {*} mysqlHelper 
 * @param {*} tableItem 
 */
const findorder = async (columnList, tableItem) => {

  const propertyTxt = columnList.map(p =>
    `  ${inflect.camelize(p.COLUMN_NAME, false)} = '${inflect.camelize(p.COLUMN_NAME, false)}'`
  ).join(`,
`);
  return modelTemplate(propertyTxt, tableItem);
}

module.exports = findorder;