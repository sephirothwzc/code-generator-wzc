/*
 * @Author: zhanchao.wu
 * @Date: 2020-04-08 23:05:41
 * @Last Modified by: zhanchao.wu
 * @Last Modified time: 2020-09-17 14:37:35
 */
const mysql = require('mysql');

const findTablesSql = Symbol();
const findColumnSql = Symbol();
const findKeyColumn = Symbol();

class MySqlHelper {
  constructor(conn) {
    this.connString = conn;
  }

  [findTablesSql]() {
    return `select table_name AS name,table_comment AS comment from information_schema.tables where table_name <> 'sequelizemeta' and table_schema='${this.connString.database}' order by table_name`;
  }

  [findColumnSql](tableName) {
    return `SELECT * FROM information_schema.columns WHERE table_schema='${this.connString.database}' AND table_name='${tableName}' order by COLUMN_NAME`;
  }

  [findKeyColumn](tableName) {
    /**
     * C.TABLE_SCHEMA            拥有者
     * C.REFERENCED_TABLE_NAME  父表名称 ,
     * C.REFERENCED_COLUMN_NAME 父表字段 ,
     * C.TABLE_NAME             子表名称,
     * C.COLUMN_NAME            子表字段,
     * C.CONSTRAINT_NAME        约束名,
     * T.TABLE_COMMENT          表注释,
     * R.UPDATE_RULE            约束更新规则,
     * R.DELETE_RULE            约束删除规则
     */
    return `SELECT C.TABLE_SCHEMA,
           C.REFERENCED_TABLE_NAME,
           C.REFERENCED_COLUMN_NAME,
           C.TABLE_NAME,
           C.COLUMN_NAME,
           C.CONSTRAINT_NAME,
           T.TABLE_COMMENT,
           R.UPDATE_RULE,
           R.DELETE_RULE
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE C
      JOIN INFORMATION_SCHEMA. TABLES T
        ON T.TABLE_NAME = C.TABLE_NAME
      JOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS R
        ON R.TABLE_NAME = C.TABLE_NAME
       AND R.CONSTRAINT_NAME = C.CONSTRAINT_NAME
       AND R.REFERENCED_TABLE_NAME = C.REFERENCED_TABLE_NAME
      WHERE C.REFERENCED_TABLE_NAME IS NOT NULL 
				AND C.REFERENCED_TABLE_NAME = '${tableName}' or C.TABLE_NAME = '${tableName}'
        AND C.TABLE_SCHEMA = '${this.connString.database}'
        group by TABLE_SCHEMA`;
  }

  async query(sql) {
    const connection = mysql.createConnection({
      host: this.connString.host,
      port: this.connString.port,
      user: this.connString.username,
      password: this.connString.password,
      database: this.connString.database,
    });

    await connection.connect((err) => {
      if (err) {
        console.log(`err:${err}`);
      }
    });
    const result = await new Promise((resolve, reject) => {
      connection.query(sql, (err, rows) => {
        if (err) {
          console.log(`query err:${err}`);
          reject(err);
        }
        resolve(rows);
      });
    });
    await connection.end(() => {});
    return result;
  }

  async queryTable() {
    return this.query(this[findTablesSql]());
  }

  async queryColumn(tableName) {
    return this.query(this[findColumnSql](tableName));
  }

  /**
   * 获取表外键
   * @param {string} tableName
   */
  async queryKeyColumn(tableName) {
    return this.query(this[findKeyColumn](tableName));
  }
}

module.exports = MySqlHelper;
