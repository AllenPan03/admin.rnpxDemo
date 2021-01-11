const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const replace = require('gulp-replace');
const rename = require('gulp-rename');
const log = console.log;

// util
let util = {};

// 文件操作

/**
 * 返回指定目录中文件夹列表
 * @param {String} dir 目录路径
 * @param {function} cb 删除后回调
 * @return 目录列表数组
 */
util.dirListInDir = function (pattern) {
  let pa = fs.readdirSync(pattern);
  let dirList = [];
  pa.forEach(function (ele, index) {
    var info = fs.statSync(pattern + '/' + ele);
    if (info.isDirectory() && ele != 'Common') {
      dirList.push(ele);
    }
  });
  return dirList;
};

/**
 * 删除非空目录
 * @param {String} pattern 目录路径
 */
util.rmdirSync = (function () {
  function iterator(url, dirs) {
    var stat = fs.statSync(url);
    if (stat.isDirectory()) {
      dirs.unshift(url); //收集目录
      inner(url, dirs);
    } else if (stat.isFile()) {
      fs.unlinkSync(url); //直接删除文件
    }
  }
  function inner(path, dirs) {
    var arr = fs.readdirSync(path);
    for (var i = 0, el; (el = arr[i++]); ) {
      iterator(path + '/' + el, dirs);
    }
  }
  return function (dir, cb) {
    cb = cb || function () {};
    var dirs = [];

    try {
      iterator(dir, dirs);
      for (var i = 0, el; (el = dirs[i++]); ) {
        fs.rmdirSync(el); //一次性删除所有收集到的目录
      }
      cb();
    } catch (e) {
      //如果文件或目录本来就不存在，fs.statSync会报错，不过我们还是当成没有异常发生
      e.code === 'ENOENT' ? cb() : cb(e);
    }
  };
})();

// 数组

/**
 * 清除一个数组中值为空的项
 * @param {Array} array
 * @return 处理后的数组
 */
util.cleanEmptyInArray = function (array) {
  let [...newArray] = array;
  const count = newArray.length;
  for (let i = count - 1; i >= 0; i--) {
    if (newArray[i] === '' || newArray[i] === null || newArray[i] === undefined) {
      newArray.splice(i, 1);
    }
  }
  return newArray;
};

// api模板路径
const TPL_API_PATH = path.resolve(__dirname, './config/@tpl/@api');
// api列表索引
let apisIndex = 0;
// api列表
let apisArr = [];
// 创建api文件的目标目录
let buildPath = '';
// api数据
let apiDatas = {};
// 是否覆盖
let isOverride = false;

let api = {};

/**
 * 生成适用于微信的api接口
 * @param {String} dir 创建目录
 * @param {Object} data api数据
 * @param {Boolean} override 是否重新生成，会先清空原来生成的文件
 */
api.buildADMIN = (dir, data, override) => {
  api.build(dir, data, override);
  // 生成mock文件
  const cwdPath = process.cwd();
  const mockFilePath = `${cwdPath}/mock`;
  api.clean(mockFilePath);
};

/**
 * 生成api接口
 * @param {String} dir 创建目录
 * @param {Object} data api数据
 * @param {Boolean} override 是否重新生成，会先清空原来生成的文件
 */
api.build = (dir, data, override) => {
  console.log(dir);
  console.log(override);
  let { ...newData } = data;
  apiDatas = data; // 缓存到全局
  isOverride = override;
  buildPath = dir;

  // 如果覆盖，先清除源目录
  if (override) {
    api.clean(dir);
  }

  for (let key in newData.paths) {
    newData.paths[key].url = key;
    apisArr.push(newData.paths[key]);
  }

  api.buildOne(apisArr[apisIndex]);
};

/**
 * 生成指定的一个api接口
 * @param {Object} data 指定的一个api数据
 */
api.buildOne = function (data) {
  console.log(data);
  let urlArr = util.cleanEmptyInArray(data.url.split('/'));
  let apiPath = buildPath;

  for (let i = 0; i < urlArr.length - 2; i++) {
    apiPath += `${urlArr[i]}/`;
  }

  let API_NAME = urlArr[urlArr.length - 1];
  if (API_NAME === 'delete') {
    // delete不能作为函数方法名
    API_NAME = 'delete_1';
  }
  const API_dESCRIBE = (Object.values(data).length > 0 && Object.values(data)[0].summary) || '';
  const API_URL = `"${urlArr.join('/')}"`;
  const API_METHOD = `"${Object.keys(data)[0] || 'post'}"`;
  let API_DATA = 'data';
  if (API_METHOD == `"get"`) {
    API_DATA = 'params';
  }
  // headers 处理
  let api_headers_head = '{';
  let api_headers_body = '';
  if (data.contentType) {
    api_headers_body += `\n      "Content-Type": "${data.consumes}"`;
  }
  let api_headers_foot = api_headers_body ? '\n    }' : '}';
  const API_HEADERS = api_headers_head + api_headers_body + api_headers_foot;

  // 接口注释处理
  let paramsArr = [];
  for (let param in data.parameters) {
    if (API_METHOD == `"get"`) {
      paramsArr.push({
        name: param,
        info: data.parameters[param],
      });
    } else if (API_METHOD == `"post"`) {
      if (apiDatas.types[data.parameters[param].type]) {
        let properties = apiDatas.types[data.parameters[param].type].properties;
        for (let prop in properties) {
          paramsArr.push({
            name: prop,
            info: properties[prop],
          });
        }
      }
    }
  }

  let api_annotation_head = '/**';
  let api_annotation_body = `\n * ${API_dESCRIBE}`;
  let api_annotation_foot = '\n */';
  // 如果有请求参数
  if (paramsArr.length > 0) {
    api_annotation_body += `\n * @param { Object } data 请求参数`;
    api_annotation_body += `\n * {`;
    for (let i = 0; i < paramsArr.length; i++) {
      api_annotation_body += `\n *   ${paramsArr[i].name} ${paramsArr[i].info.summary}`;
    }
    api_annotation_body += `\n * }`;
  }
  const API_ANNOTATION = api_annotation_head + api_annotation_body + api_annotation_foot;

  // 命名接口文件名称
  let apiFileName = `${urlArr[urlArr.length - 2] || 'other'}.js`;
  if (apiFileName.indexOf('{') >= 0) {
    apiFileName = `${urlArr[urlArr.length - 1]}.js`;
  }

  // 目标文件路径
  let targetApiFilePath = `${apiPath}${apiFileName}`;
  // 模板文件路径
  let tplApiFilePath = `${TPL_API_PATH}/admin.js`;
  // 如果目标文件已存在 并且不要覆盖
  if (fs.existsSync(targetApiFilePath)) {
    // 读取目标文件内容
    let targetFileContent = fs.readFileSync(targetApiFilePath, 'utf-8');

    // 检查目标文件内是否已有该接口
    let matchText = '';
    matchText = `export = function ${API_NAME}(data) {`;
    if (targetFileContent.indexOf(matchText) >= 0) {
      // log("这个api已存在...下一个")
      api.buildNext();
      return;
    }

    // 读取模板文件内容
    let tplFileContent = fs.readFileSync(tplApiFilePath, 'utf-8');
    let newTplFileContent = tplFileContent
      .replace(/__api_annotation__/g, API_ANNOTATION)
      .replace(/__api_name__/g, API_NAME)
      .replace(/__url__/g, API_URL)
      .replace(/__method__/g, API_METHOD)
      .replace(/__data__/, API_DATA)
      .replace(/__headers__/g, API_HEADERS);

    log('api名称: ' + API_NAME);
    log('api描述: ' + API_dESCRIBE);
    log('api地址: ' + API_URL);

    // 写入新内容
    try {
      fs.writeFileSync(targetApiFilePath, `${targetFileContent}\n${newTplFileContent}`, 'utf8');
      log(`api ${API_NAME} 创建成功`);
    } catch (error) {
      log(`api ${API_NAME} 创建失败，原因：${error}`);
    }

    api.buildNext();
  } else {
    console.log(targetApiFilePath);
    console.log(apiFileName);
    console.log(apiPath);
    // 如果目标文件不存在， 创建目标文件
    gulp
      .src(tplApiFilePath)
      .pipe(rename(apiFileName))
      .pipe(replace('__api_annotation__', API_ANNOTATION))
      .pipe(replace('__api_name__', API_NAME))
      .pipe(replace('__url__', API_URL))
      .pipe(replace('__method__', API_METHOD))
      .pipe(replace('__data__', API_DATA))
      .pipe(replace('__headers__', API_HEADERS))
      .pipe(gulp.dest(apiPath))
      .on('end', () => {
        // 读取目标文件内容
        let targetFileContent = fs.readFileSync(targetApiFilePath, 'utf-8');
        fs.writeFileSync(
          targetApiFilePath,
          `import request from '@/utils/request';\n${targetFileContent}`,
          'utf8',
        );
        log(`api ${API_NAME} 创建成功`);
        api.buildNext();
      });
  }
};

/**
 * 生成下一个api接口
 */
api.buildNext = function () {
  apisIndex++;
  if (apisArr[apisIndex]) {
    api.buildOne(apisArr[apisIndex]);
  } else {
    log('api创建结束');
  }
};

/**
 * 清除空api，fetch.js除外
 */
api.clean = function (dir) {
  let fetchContent = '';
  if (fs.existsSync(`${dir}fetch.js`)) {
    fetchContent = fs.readFileSync(`${dir}fetch.js`, 'utf-8');
  }
  util.rmdirSync(dir);
  fs.mkdirSync(dir);

  if (fetchContent) {
    fs.writeFileSync(`${dir}fetch.js`, fetchContent, 'utf8');
  }
};

const cwdPath = process.cwd();
// api.json文件路径
const apiJsonFilePath = `${cwdPath}/api.json`;
// src/api/ 路径
const apiDirPath = `${cwdPath}/src/components/api/`;
if (fs.existsSync(apiJsonFilePath)) {
  const apiJson = require(apiJsonFilePath);
  api.buildADMIN(apiDirPath, apiJson, true);
} else {
  log('api.json文件不存在');
}
