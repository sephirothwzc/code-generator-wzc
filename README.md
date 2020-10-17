### 关于 code-generator-wzc

项目地址：
https://github.com/sephirothwzc/code-generator-wzc

感谢：
egg、midway

使用说明：

```node
$ npm install code-generator-wzc --save-dev
# or yarn
$ yarn add code-generator-wzc -D
```

package.json

```md
"scripts": {
"codeGeneratorWzc": "node ./node_modules/code-generator-wzc/index.js"
}
```

run

```node
# run
$ yarn codeGeneratorWzc
```

### changelog

- 外键属性命名 表名+字段名
- count 与 list 分开 删除 all 方法 对象名+Count
