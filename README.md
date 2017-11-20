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

## Install

```bash
$ npm i egg-connector-remote --save
```

## Usage

```js
// {app_root}/config/plugin.js
exports.connectorRemote = {
  enable: true,
  package: 'egg-connector-remote',
};
```

## Configuration

```js
// {app_root}/config/config.default.js
exports.connectorRemote = {
};
```

see [config/config.default.js](config/config.default.js) for more detail.

## Example

<!-- example here -->

## Questions & Suggestions

Please open an issue [here](https://github.com/eggjs/egg/issues).

## License

[MIT](LICENSE)
