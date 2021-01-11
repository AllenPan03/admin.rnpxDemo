import request from '@/utils/request';
/**
 * 
 */;
export function detail(options = {}) {
  return request("front/news/detail", {
    method: "get",
    params: options || {},
  });
}

/**
 * 
 */;
export function list(options = {}) {
  return request("front/news/list", {
    method: "get",
    params: options || {},
  });
}
