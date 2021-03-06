#!/usr/bin/env node
/*
 * @Author: zhanchao.wu
 * @Date: 2020-04-08 22:09:13
 * @Last Modified by: zhanchao.wu
 * @Last Modified time: 2020-10-31 14:57:35
 */
const path = require('path');
const inquirer = require('inquirer');
const chalk = require('chalk');
const figlet = require('figlet');
const shell = require('shelljs');
const _ = require('lodash');
const MysqlHelper = require('./utils/mysql-helper');
// eslint-disable-next-line no-unused-vars
// const findmodel = require('./template/graphql-sequelize-model');
// eslint-disable-next-line no-unused-vars
// const findinput = require('./template/graphql-input');
// eslint-disable-next-line no-unused-vars
// const findargs = require('./template/graphql-args');
// eslint-disable-next-line no-unused-vars
// const findorder = require('./template/graphql-order');

const findSequelizeModel = require('./template/graphql-sequelize-model');

const findservice = require('./template/service');

const findgraphql = require('./template/graphql-gql');

const findresolver = require('./template/graphql-resolver');

const findschema = require('./template/graphql-schema');

const findhelper = require('./template/graphql-helper');

const findhook = require('./template/graphql-hook');

const fs = require('fs');
const { promisify } = require('util');

const modelFunction = {
  findSequelizeModel,
  findservice,
  findgraphql,
  findresolver,
  findschema,
  findhelper,
  findhook,
  // findmodel,
  // findinput,
  // findargs,
  // findorder,
};

// const codeTypeArray = ['SequelizeModel', 'service', 'graphql', 'model', 'args', 'input', 'order'];
const codeTypeArray = [
  'SequelizeModel',
  'graphql',
  'schema',
  'resolver',
  'service',
  'hook',
  'helper',
];
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
      name: 'username',
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
      name: 'database',
      type: 'input',
      message: '数据库？',
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

const filePathObj = {
  SequelizeModel: './src/lib/models',
  service: './src/service',
  graphql: './src/app/graphql',
  resolver: './src/app/graphql',
  schema: './src/lib/schemas',
  helper: './packages/model',
  hook: './src/lib/hooks',
};
/**
 * 创建文件
 * @param {string} filename 文件名
 */
const createFile = async (filename, txt, type) => {
  const filePath = _.get(filePathObj, type, `./out/${type}`);
  if (type === 'graphql' || type === 'resolver') {
    const codeName = type === 'graphql' ? 'schema.graphql' : 'resolver.js';
    shell.mkdir('-p', `${filePath}/${filename}`);
    return new Promise((resolve, reject) => {
      fs.writeFile(`${filePath}/${filename}/${codeName}`, txt, (error) => {
        error ? reject(error) : resolve();
      });
    });
  }
  // 文件名后缀
  let suffix = type;
  if (['SequelizeModel', 'helper'].includes(type)) {
    suffix = 'model';
  }
  // const suffix = type !== 'SequelizeModel' ? type : 'model';
  shell.mkdir('-p', filePath);
  return new Promise((resolve, reject) => {
    fs.writeFile(`${filePath}/${filename}.${suffix}.ts`, txt, (error) => {
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

/**
 * 路径是否存在
 * @param {string} configPath
 */
const pathexists = async (configPath) => {
  const accessAsync = promisify(fs.access);
  return accessAsync(configPath)
    .then(() => {
      return true;
    })
    .catch(() => {
      return false;
    });
};

const envConfig = async () => {
  // 判断是否midway config存在
  const configPath = './database/config.json',
    // 本地文件
    localConfigPath = path.join(__dirname, './config/config.json');
  const sequelizeCliConfigExists = await pathexists(configPath);
  const localConfig = await pathexists(localConfigPath);
  if (!sequelizeCliConfigExists && !localConfig) {
    console.error(
      chalk.white.bgRed.bold(`Error: `) +
        `\t [${configPath}] not find,must have local sequelize-cli!`
    );
    throw new Error(`\t [${configPath}] not find,must have local sequelize-cli!`);
  } else if (sequelizeCliConfigExists) {
    const dbConfig = shell.cat(configPath);
    /**
     *    "username": "xx",
          "password": "xx",
          "database": "xx",
          "host": "xx",
          "port": "xx",
          "dialect": "mysql"
     */
    return JSON.parse(dbConfig).development;
  } else {
    const dbConfig = shell.cat('./config/config.json');
    // const dbConfig = shell.cat('./config/config.json');
    return JSON.parse(dbConfig);
  }
};

const setEnvConfig = async () => {
  // ask questions
  const answers = await askQuestions();
  shell.echo(JSON.stringify(answers)).to(path.join(__dirname, './config/config.json'));
  return answers;
};

/**
 * 确认配置
 */
const confirmDBConfig = async ({ database }) => {
  const questions = [
    {
      name: 'dbRest',
      type: 'confirm',
      message: `是否采用[${database}]设置`,
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
  let answers = await envConfig();
  if (!answers || (await confirmDBConfig(answers))) {
    answers = await setEnvConfig();
  }
  // const { dialect, host, port, userName, password, database } = answers;

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
  const type = await askListQuestions(codeTypeArray, 'fileType', 'checkbox');
  // // 输出目录 再说吧
  // const dirpath = await
  result.tableName.forEach(async (p) => {
    const columnList = await mysqlHelper.queryColumn(p.name);
    const keyColumnList = await mysqlHelper.queryKeyColumn(p.name);
    // 获取文件模版
    type.fileType.forEach(async (t) => {
      const funcName = `find${t}`;
      const tempTxt = await modelFunction[funcName](columnList, p, keyColumnList);
      if (!tempTxt) {
        // 输出内容为空则 不生成文件
        return;
      }
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
