import { parse } from 'querystring';
import pathRegexp from 'path-to-regexp';

/* eslint no-useless-escape:0 import/prefer-default-export:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;
export const isUrl = (path) => reg.test(path);
export const isAntDesignPro = () => {
  if (ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION === 'site') {
    return true;
  }

  return window.location.hostname === 'preview.pro.ant.design';
}; // 给官方演示站点用，用于关闭真实开发环境不需要使用的特性

export const isAntDesignProOrDev = () => {
  const { NODE_ENV } = process.env;

  if (NODE_ENV === 'development') {
    return true;
  }

  return isAntDesignPro();
};
export const getPageQuery = () => parse(window.location.href.split('?')[1]);
/**
 * props.route.routes
 * @param router [{}]
 * @param pathname string
 */

export const getAuthorityFromRouter = (router = [], pathname) => {
  const authority = router.find(
    ({ routes, path = '/', target = '_self' }) =>
      (path && target !== '_blank' && pathRegexp(path).exec(pathname)) ||
      (routes && getAuthorityFromRouter(routes, pathname)),
  );
  if (authority) return authority;
  return undefined;
};
export const getRouteAuthority = (path, routeData) => {
  let authorities;
  routeData.forEach((route) => {
    // match prefix
    if (pathRegexp(`${route.path}/(.*)`).test(`${path}/`)) {
      if (route.authority) {
        authorities = route.authority;
      } // exact match

      if (route.path === path) {
        authorities = route.authority || authorities;
      } // get children authority recursively

      if (route.routes) {
        authorities = getRouteAuthority(path, route.routes) || authorities;
      }
    }
  });
  return authorities;
};
const dateFormators = {
  __proto__: null,
  y: (date, format) => {
    const year = date.getFullYear()
    return format.length < 3 ? year % 100 : year
  },
  M: (date) => date.getMonth() + 1,
  d: (date) => date.getDate(),
  H: (date) => date.getHours(),
  m: (date) => date.getMinutes(),
  s: (date) => date.getSeconds(),
  e: (date) => "日一二三四五六".charAt(date.getDay())
}
/**
 * 格式化日期对象
 * @param date 日期对象
 * @param format 格式字符串，其中以下字符（区分大小写）会被替换：
 *
 * 字符| 意义          | 示例
 * ----|--------------|--------------------
 * y   | 年           | yyyy: 1999, yy: 99
 * M   | 月           | MM: 09, M: 9
 * d   | 日           | dd: 09, d: 9
 * H   | 时（24小时制）| HH: 13, H: 13
 * m   | 分           | mm: 06, m: 6
 * s   | 秒           | ss: 06, s: 6
 * e   | 周（中文）    | 周e: 周一
 *
 * @return 返回格式化后的字符串
 * @example formatDate(new Date("2016/01/01 00:00:00")) // "2016/01/01 00:00:00"
 * @example formatDate(new Date("2016/01/01 00:00:00"), "yyyyMMdd") // "20160101"
 * @see https://docs.oracle.com/javase/7/docs/api/java/text/SimpleDateFormat.html
 */
export const formatDate = (date = new Date(), format = "yyyy/MM/dd HH:mm:ss e") => {
  if (date && !(date instanceof Date)) {
    date = new Date(Number(date))
  }
  if (!+date) {
    return ""
  }
  return format.replace(/([yMdHmse])\1*/g, (all, key) => {
    key = (dateFormators)[key](date, all) + ""
    while (key.length < all.length) {
      key = "0" + key
    }
    return key
  })
}
