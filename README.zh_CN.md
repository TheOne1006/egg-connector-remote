# egg-connector-remote

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-connector-remote.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-connector-remote
[travis-image]: https://img.shields.io/travis/TheOne1006/egg-connector-remote.svg?style=flat-square
[travis-url]: https://travis-ci.org/TheOne1006/egg-connector-remote
[codecov-image]: https://img.shields.io/codecov/c/github/TheOne1006/egg-connector-remote.svg?style=flat-square
[codecov-url]: https://codecov.io/github/TheOne1006/egg-connector-remote?branch=master
[david-image]: https://img.shields.io/david/TheOne1006/egg-connector-remote.svg?style=flat-square
[david-url]: https://david-dm.org/TheOne1006/egg-connector-remote
[snyk-image]: https://snyk.io/test/npm/egg-connector-remote/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-connector-remote
[download-image]: https://img.shields.io/npm/dm/egg-connector-remote.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-connector-remote

<!--
Description here.
-->

## 依赖说明

规则来自于
<https://editor.swagger.io//?_ga=2.41951072.471192285.1510301833-940518916.1510301833#/>


### 依赖的 egg 版本

egg-connector-remote 版本 | egg 1.x
--- | ---
1.x | 😁
0.x | ❌

### 依赖的插件

未依赖

## 开启插件

```js
// config/plugin.js
exports.connectorRemote = {
  enable: true,
  package: 'egg-connector-remote',
};
```
## 功能

## 使用场景

- 类似 loopback 的 rest方式暴露出 `swagger.json`


## 详细配置

```js
  // 默认配置
  const defaultConfig = {
    modelsPath: 'model.models',
    swaggerDefinition: {
      info: { // API informations (required)
        title: 'theone.io', // Title (required)
        version: '1.0.0', // Version (required)
        description: 'swagger service description', // Description (optional)
      },
      basePath: '/api/v1',
    },
    registerRemote: true, // 开启注册 remote 功能
    accessRemoteDefinition: {
      roleModel: undefined, // role 的 Model, 需要实现
      userModel: undefined, // user 的 Model, 需要实现
    },
  };
```

## 单元测试
```bash
npm run test
```

## feature

1. [x] config2swagger： 使用 model.setting 的配置生成 swagger相关文件。
2. [x] remote：自动处理 Model.setting 和 ctrl 的关系以及路由的关系
3. [x] Test parameter: 自动校验输入输出参数
4. [x] access controller: 访问控制, 权鉴设置

## 提问交流

请到 [egg issues](https://github.com/TheOne1006/egg-connector-remote/issues) 异步交流。

## 附件
1. [复数lib](https://github.com/blakeembrey/pluralize) - 强迫症患者使用

## License

[MIT](LICENSE)
