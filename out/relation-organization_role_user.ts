
import { Table, Column, DataType } from 'sequelize-typescript';
import { ModelBase } from 'libs/base/src/model.base';

// #region enum
// #endregion

@ArgsType()
@ObjectType({description:'组织机构角色对应用户表'})
@Table({
  tableName: 'relation_organization_role_user',
})
export class relationOrganizationRoleUserModel extends ModelBase {

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
  @Field({ description: 'i18n' }, ()=> GraphQLJSON)
  @Column({ comment: 'i18n', type: DataType.JSON })
  i18N?: Record<string, any>;

  /**
   * id
   */
  @Field({ description: 'id' })
  @Column({ comment: 'id', type: DataType.STRING(50) })
  id?: string;

  /**
   * 组织机构角色id
   */
  @Field({ description: '组织机构角色id' })
  @Column({ comment: '组织机构角色id', type: DataType.STRING(50) })
  organizationRoleId?: string;

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

  /**
   * 用户id
   */
  @Field({ description: '用户id' })
  @Column({ comment: '用户id', type: DataType.STRING(50) })
  userId?: string;

}

// 常量生成
export class RELATION_ORGANIZATION_ROLE_USER {

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
   * 组织机构角色id
   */
  static readonly ORGANIZATION_ROLE_ID: string = 'organizationRoleId';

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

  /**
   * 用户id
   */
  static readonly USER_ID: string = 'userId';

}
