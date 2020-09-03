#!/usr/bin/env node
/*
 * @Author: zhanchao.wu
 * @Date: 2020-04-08 22:09:13
 * @Last Modified by: zhanchao.wu
 * @Last Modified time: 2020-09-03 23:24:36
 */

const inquirer = require('inquirer');
const chalk = require('chalk');
const figlet = require('figlet');
const shell = require('shelljs');
// const _ = require('lodash');
const MysqlHelper = require('./utils/mysql-helper');
// eslint-disable-next-line no-unused-vars
const findmodel = require('./template/graphql-sequelize-model');
// eslint-disable-next-line no-unused-vars
const findinput = require('./template/graphql-input');
// eslint-disable-next-line no-unused-vars
const findargs = require('./template/graphql-args');
// eslint-disable-next-line no-unused-vars
const findorder = require('./template/graphql-order');

const findSequelizeModel = require('./template/graphql-sequelize-model');
const fs = require('fs');

const modelFunction = {
  findmodel,
  findinput,
  findargs,
  findorder,
  findSequelizeModel,
};

/**
 * 初始化
 */
const init = () => {
  console.log(
    chalk.green(
      figlet.textSync('zhanchao.wu', {
        font: 'Ghost',
        horizontalLayout: 'default',
        verticalLayout: 'default',
      })
    )
  );
};

/**
 * 参数文件获取
 */
const askQuestions = () => {
  const questions = [
    {
      name: 'dialect',
      type: 'list',
      message: '数据库类型？',
      choices: ['mysql'],
    },
    {
      name: 'host',
      type: 'input',
      message: '数据库地址？',
    },
    {
      name: 'port',
      type: 'number',
      message: '数据库端口？',
      default: '3306',
    },
    {
      name: 'userName',
      type: 'input',
      message: '数据库登陆用户？',
      default: 'root',
    },
    {
      name: 'password',
      type: 'password',
      message: '数据库登陆密码？',
    },
    {
      name: 'databaseName',
      type: 'input',
      message: '数据库？',
    },
    {
      name: 'dbName',
      type: 'input',
      message: '数据库设置名称？',
    },
  ];
  return inquirer.prompt(questions);
};

const askListQuestions = (list, key, type = 'list', message = key) => {
  const questions = [
    {
      name: key,
      type,
      message: message,
      choices: list,
    },
  ];
  return inquirer.prompt(questions);
};

/**
 * 创建文件
 * @param {string} filename 文件名
 */
const createFile = async (filename, txt, type) => {
  shell.mkdir('-p', `./out/${type}`);
  // 文件名后缀
  const suffix = type !== 'SequelizeModel' ? type : 'model';
  return new Promise((resolve, reject) => {
    fs.writeFile(`./out/${type}/${filename}.${suffix}.ts`, txt, (error) => {
      error ? reject(error) : resolve();
    });
  });
};

/**
 * 成功提示
 * @param {string} filepath 文件路径
 */
const success = (filepath) => {
  console.log(chalk.white.bgGreen.bold(`Done! File created`) + `\t [${filepath}]`);
};

const envConfig = () => {
  const dbConfig = shell.cat('./config/config.json');
  return JSON.parse(dbConfig);
};

const setEnvConfig = async () => {
  // ask questions
  const answers = await askQuestions();
  shell.echo(JSON.stringify(answers)).to('./config/config.json');
  return answers;
};

/**
 * 确认配置
 */
const confirmDBConfig = async ({ dbName }) => {
  const questions = [
    {
      name: 'dbRest',
      type: 'confirm',
      message: `是否采用[${dbName}]设置`,
      default: 'Y',
    },
  ];
  const value = await inquirer.prompt(questions);
  return !value.dbRest;
};

/**
 * 执行
 */
const run = async () => {
  // show script introduction
  init();

  // 判断是否存在历史
  let answers = envConfig();
  if (!answers || !answers.dbName || (await confirmDBConfig(answers))) {
    answers = await setEnvConfig();
  }
  // const { dialect, host, port, userName, password, databaseName } = answers;

  // #region find table
  const mysqlHelper = new MysqlHelper(answers);
  const tableList = await mysqlHelper.queryTable();

  const nameList = tableList.map((p) => {
    return {
      name: `${p.name}--${p.comment}`,
      value: p,
    };
  });
  // #endregion
  // 选择导出表格
  const result = await askListQuestions(nameList, 'tableName', 'checkbox');
  // 选择导出对象
  const type = await askListQuestions(['model', 'args', 'input', 'order', 'SequelizeModel'], 'fileType', 'checkbox');
  // // 输出目录 再说吧
  // const dirpath = await
  result.tableName.forEach(async (p) => {
    const columnList = await mysqlHelper.queryColumn(p.name);
    const keyColumnList = await mysqlHelper.queryKeyColumn(p.name);
    // 获取文件模版
    type.fileType.forEach(async (t) => {
      const funcName = `find${t}`;
      const tempTxt = await modelFunction[funcName](columnList, p, keyColumnList);
      const filename = p.name.replace(/_/g, '-');
      createFile(filename, tempTxt, t)
        .then(() => {
          success(filename);
        })
        .catch((error) => {
          console.error(chalk.white.bgRed.bold(`Error: `) + `\t [${filename}]${error}!`);
        });
    });
  });
};

run();
