import request from '@/utils/request';
/**
 * 
 */;
export function getPro(options = {}) {
  return request("front/product/getPro", {
    method: "get",
    params: options || {},
  });
}

/**
 * 
 */;
export function list(options = {}) {
  return request("front/product/list", {
    method: "get",
    params: options || {},
  });
}
