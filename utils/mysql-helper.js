/*
 * @Author: zhanchao.wu
 * @Date: 2020-04-08 23:05:41
 * @Last Modified by: zhanchao.wu
 * @Last Modified time: 2020-04-09 23:00:47
 */
const mysql = require('mysql');

const findTablesSql = Symbol();
const findColumnSql = Symbol();

class MySqlHelper {
  constructor(conn) {
    this.connString = conn
  }

  [findTablesSql]() {
    return `select table_name AS name,table_comment AS comment from information_schema.tables where table_schema='${
      this.connString.databaseName
      }' order by table_name`;
  }

  [findColumnSql](tableName) {
    return `SELECT * FROM information_schema.columns WHERE table_schema='${
      this.connString.databaseName
      }' AND table_name='${tableName}' order by COLUMN_NAME`;
  }

  async query(sql) {
    const connection = mysql.createConnection({
      host: this.connString.host,
      port: this.connString.port,
      user: this.connString.userName,
      password: this.connString.password,
      database: this.connString.databaseName
    });

    await connection.connect(err => {
      if (err) {
        console.log(`err:${err}`);
      }
    })
    const result = await new Promise((resolve, reject) => {
      connection.query(sql, (err, rows) => {
        if (err) {
          console.log(`query err:${err}`);
          reject(err);
        }
        resolve(rows)
      })
    })
    await connection.end(() => { })
    return result;
  }

  async queryTable() {
    return this.query(this[findTablesSql]());
  }

  async queryColumn(tableName) {
    return this.query(this[findColumnSql](tableName));
  }
}

module.exports = MySqlHelper;
