
import { Table, Column, DataType } from 'sequelize-typescript';
import { ModelBase } from 'libs/base/src/model.base';

// #region enum
// #endregion

@ArgsType()
@ObjectType({description:'系统用户'})
@Table({
  tableName: 'sys_users',
})
export class sysUsersModel extends ModelBase {

  /**
   * 头像
   */
  @Field({ description: '头像' })
  @Column({ comment: '头像', type: DataType.STRING(200) })
  avatarUrl?: string;

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
   * 邮箱
   */
  @Field({ description: '邮箱' })
  @Column({ comment: '邮箱', type: DataType.STRING(50) })
  email?: string;

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
   * 最后更新token时间
   */
  @Field({ description: '最后更新token时间' })
  @Column({ comment: '最后更新token时间', type: DataType.DATE })
  lastAt?: Date;

  /**
   * 昵称
   */
  @Field({ description: '昵称' })
  @Column({ comment: '昵称', type: DataType.STRING(50) })
  nickName?: string;

  /**
   * 密码
   */
  @Field({ description: '密码' })
  @Column({ comment: '密码', type: DataType.STRING(200) })
  password?: string;

  /**
   * 手机号
   */
  @Field({ description: '手机号' })
  @Column({ comment: '手机号', type: DataType.STRING(20) })
  phone?: string;

  /**
   * 备注
   */
  @Field({ description: '备注' })
  @Column({ comment: '备注', type: DataType.STRING(50) })
  remark?: string;

  /**
   * 最后登录的token
   */
  @Field({ description: '最后登录的token' })
  @Column({ comment: '最后登录的token', type: DataType.STRING(50) })
  token?: string;

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
   * 用户名登陆用
   */
  @Field({ description: '用户名登陆用' })
  @Column({ comment: '用户名登陆用', type: DataType.STRING(50) })
  userName?: string;

}

// 常量生成
export class SYS_USERS {

  /**
   * 头像
   */
  static readonly AVATAR_URL: string = 'avatarUrl';

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
   * 邮箱
   */
  static readonly EMAIL: string = 'email';

  /**
   * i18n
   */
  static readonly I18N: string = 'i18N';

  /**
   * id
   */
  static readonly ID: string = 'id';

  /**
   * 最后更新token时间
   */
  static readonly LAST_AT: string = 'lastAt';

  /**
   * 昵称
   */
  static readonly NICK_NAME: string = 'nickName';

  /**
   * 密码
   */
  static readonly PASSWORD: string = 'password';

  /**
   * 手机号
   */
  static readonly PHONE: string = 'phone';

  /**
   * 备注
   */
  static readonly REMARK: string = 'remark';

  /**
   * 最后登录的token
   */
  static readonly TOKEN: string = 'token';

  /**
   * 
   */
  static readonly UPDATED_AT: string = 'updatedAt';

  /**
   * 修改人id
   */
  static readonly UPDATED_USER: string = 'updatedUser';

  /**
   * 用户名登陆用
   */
  static readonly USER_NAME: string = 'userName';

}
