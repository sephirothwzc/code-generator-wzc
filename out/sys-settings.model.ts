
import { Table, Column, DataType } from 'sequelize-typescript';
import { ModelBase } from 'libs/base/src/model.base';
import { ArgsType, ObjectType, Field } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

// #region enum
  export enum Etype {

  /**
   * 是否类型
   */
  boolType= 0
  ,
  /**
   * 文本类型
   */
  stringType= 1
  ,
  /**
   * 数字类型
   */
  numberType= 2
  ,
  /**
   * 下拉选择
   */
  selectType= 3
  
    }

// #endregion

@ArgsType()
@ObjectType({description:'系统设置表'})
@Table({
  tableName: 'sys_settings',
})
export class SysSettingsModel extends ModelBase {

  /**
   * 编码
   */
  @Field({ description: '编码' })
  @Column({ comment: '编码', type: DataType.STRING(50) })
  code?: string;

  /**
   * created_at
   */
  @Field({ description: '' })
  @Column({ comment: '', type: DataType.DATE })
  createdAt?: Date;

  /**
   * 创建人id
   */
  @Field({ description: '创建人id' })
  @Column({ comment: '创建人id', type: DataType.STRING(50) })
  createdUser?: string;

  /**
   * deleted_at
   */
  @Field({ description: '' })
  @Column({ comment: '', type: DataType.DATE })
  deletedAt?: Date;

  /**
   * i18n
   */
  @Field(()=> GraphQLJSON, { description: 'i18n' })
  @Column({ comment: 'i18n', type: DataType.JSON })
  i18N?: Record<string, any>;

  /**
   * id
   */
  @Field({ description: 'id' })
  @Column({ comment: 'id', type: DataType.STRING(50) })
  id?: string;

  /**
   * 设置键
   */
  @Field({ description: '设置键' })
  @Column({ comment: '设置键', type: DataType.STRING(50) })
  key?: string;

  /**
   * 备注
   */
  @Field({ description: '备注' })
  @Column({ comment: '备注', type: DataType.STRING(50) })
  remark?: string;

  /**
   * 设置类型[boolType 0 是否类型,stringType 1 文本类型,numberType 2 数字类型,selectType 3 下拉选择]
   */
  @Field({ description: '设置类型[boolType 0 是否类型,stringType 1 文本类型,numberType 2 数字类型,selectType 3 下拉选择]' })
  @Column({ comment: '设置类型[boolType 0 是否类型,stringType 1 文本类型,numberType 2 数字类型,selectType 3 下拉选择]', type: DataType.STRING(50) })
  type?: type;

  /**
   * updated_at
   */
  @Field({ description: '' })
  @Column({ comment: '', type: DataType.DATE })
  updatedAt?: Date;

  /**
   * 修改人id
   */
  @Field({ description: '修改人id' })
  @Column({ comment: '修改人id', type: DataType.STRING(50) })
  updatedUser?: string;

  /**
   * 设置值
   */
  @Field({ description: '设置值' })
  @Column({ comment: '设置值', type: DataType.STRING(2000) })
  value?: string;

}

// eslint-disable-next-line @typescript-eslint/class-name-casing
export class SYS_SETTINGS {

  /**
   * 编码
   */
  static readonly CODE: string = 'code';

  /**
   * 
   */
  static readonly CREATED_AT: string = 'createdAt';

  /**
   * 创建人id
   */
  static readonly CREATED_USER: string = 'createdUser';

  /**
   * 
   */
  static readonly DELETED_AT: string = 'deletedAt';

  /**
   * i18n
   */
  static readonly I18N: string = 'i18N';

  /**
   * id
   */
  static readonly ID: string = 'id';

  /**
   * 设置键
   */
  static readonly KEY: string = 'key';

  /**
   * 备注
   */
  static readonly REMARK: string = 'remark';

  /**
   * 设置类型[boolType 0 是否类型,stringType 1 文本类型,numberType 2 数字类型,selectType 3 下拉选择]
   */
  static readonly TYPE: string = 'type';

  /**
   * 
   */
  static readonly UPDATED_AT: string = 'updatedAt';

  /**
   * 修改人id
   */
  static readonly UPDATED_USER: string = 'updatedUser';

  /**
   * 设置值
   */
  static readonly VALUE: string = 'value';

}
