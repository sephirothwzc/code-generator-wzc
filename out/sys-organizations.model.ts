
import { Table, Column, DataType } from 'sequelize-typescript';
import { ModelBase } from 'libs/base/src/model.base';
import { ArgsType, ObjectType, Field } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

// #region enum
// #endregion

@ArgsType()
@ObjectType({description:'组织机构表'})
@Table({
  tableName: 'sys_organizations',
})
export class SysOrganizationsModel extends ModelBase {

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
   * 部门名称 default-i18n
   */
  @Field({ description: '部门名称 default-i18n' })
  @Column({ comment: '部门名称 default-i18n', type: DataType.STRING(50) })
  organizationName?: string;

  /**
   * 上级部门id
   */
  @Field({ description: '上级部门id' })
  @Column({ comment: '上级部门id', type: DataType.STRING(50) })
  parentId?: string;

  /**
   * 备注
   */
  @Field({ description: '备注' })
  @Column({ comment: '备注', type: DataType.STRING(50) })
  remark?: string;

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

}

// eslint-disable-next-line @typescript-eslint/class-name-casing
export class SYS_ORGANIZATIONS {

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
   * 部门名称 default-i18n
   */
  static readonly ORGANIZATION_NAME: string = 'organizationName';

  /**
   * 上级部门id
   */
  static readonly PARENT_ID: string = 'parentId';

  /**
   * 备注
   */
  static readonly REMARK: string = 'remark';

  /**
   * 
   */
  static readonly UPDATED_AT: string = 'updatedAt';

  /**
   * 修改人id
   */
  static readonly UPDATED_USER: string = 'updatedUser';

}
