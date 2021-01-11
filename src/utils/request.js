/**
 * request 网络请求工具
 * 更详细的 api 文档: https://github.com/umijs/umi-request
 */
import { extend } from 'umi-request';
import { notification } from 'antd';
import pck from '../../package.json';
import { getQuery } from './query';
const baseUrl = (() => {
  if (getQuery('api')) return getQuery('api');
  switch (process.env.DEFINED_ENV) {
    case 'uat':
      return pck.env.uat;
    case 'dev':
      return pck.env.dev;
    default:
      return pck.env.prd;
  }
})();
// 后台服务地址
export const API_URL = baseUrl;
const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

/**
 * 异常处理程序
 */
const errorHandler = (error) => {
  const { response, message } = error;
  if (response && response.status) {
    const errorText = codeMessage[response.status] || response.statusText;
    const { status, url } = response;

    notification.error({
      message: `请求错误 ${status}: ${url}`,
      description: errorText,
    });
  } else if (!response) {
    notification.error({
      description: message,
      message: '错误',
    });
  }
  return response;
};
/**
 * 配置request请求时的默认参数
 */
const request = extend({
  /** 默认错误处理 */
  errorHandler,

  /** 超时 */
  timeout: 10000,

  /** 跨域cookie */
  // credentials: 'include', // 默认请求是否带上cookie

  /** 默认表单请求 */
  requestType: 'form',

  /** 默认返回数据格式 */
  responseType: 'json',

  /**  */
  getResponse: false,
});


// request拦截器, 改变url 或 options.
request.interceptors.request.use((url, options) => {
  const token = localStorage.getItem('polo_token');
  if (token) {
    options.headers.Authorization = token;
  }
  return {
    url: options.mock ? url : `${baseUrl}${url}`,
    options: {
      ...options,
    },
  };
});

// response拦截器, 处理response
request.interceptors.response.use(async (response) => {
  const data = await response.clone().json();
  if (data.code === 0) {
    return data;
  } else if (data.code === 401) {
    localStorage.clear();
    window.location.replace('/user/login');
  } else if (data.code > 0) {
    notification.error({ message: '温馨提示', description: data.message });
    return data;
  } else {
    notification.error({ message: '温馨提示', description: '系统异常' });
  }
});

export default request;
