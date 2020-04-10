
import { Table, Column, DataType } from 'sequelize-typescript';
import { ModelBase } from 'libs/base/src/model.base';
import { ArgsType, ObjectType, Field } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

// #region enum
// #endregion

@ArgsType()
@ObjectType({description:'关系-组织机构-角色'})
@Table({
  tableName: 'relation_organization_role',
})
export class RelationOrganizationRoleModel extends ModelBase {

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
   * 部门id
   */
  @Field({ description: '部门id' })
  @Column({ comment: '部门id', type: DataType.STRING(50) })
  oragnizationId?: string;

  /**
   * 备注
   */
  @Field({ description: '备注' })
  @Column({ comment: '备注', type: DataType.STRING(50) })
  remark?: string;

  /**
   * 角色id
   */
  @Field({ description: '角色id' })
  @Column({ comment: '角色id', type: DataType.STRING(50) })
  roleId?: string;

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
export class RELATION_ORGANIZATION_ROLE {

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
   * 部门id
   */
  static readonly ORAGNIZATION_ID: string = 'oragnizationId';

  /**
   * 备注
   */
  static readonly REMARK: string = 'remark';

  /**
   * 角色id
   */
  static readonly ROLE_ID: string = 'roleId';

  /**
   * 
   */
  static readonly UPDATED_AT: string = 'updatedAt';

  /**
   * 修改人id
   */
  static readonly UPDATED_USER: string = 'updatedUser';

}
