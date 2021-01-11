import request from '@/utils/request';
/**
 * 
 */;
export function getPro(options = {}) {
  return request("backend/product/getPro", {
    method: "get",
    params: options || {},
  });
}

/**
 * 
 */;
export function list(options = {}) {
  return request("backend/product/list", {
    method: "get",
    params: options || {},
  });
}

/**
 * 
 */;
export function delete_1(options = {}) {
  return request("backend/product/delete", {
    method: "post",
    data: options || {},
  });
}

/**
 * 
 */;
export function add(options = {}) {
  return request("backend/product/add", {
    method: "post",
    data: options || {},
  });
}

/**
 * 
 */;
export function update(options = {}) {
  return request("backend/product/update", {
    method: "post",
    data: options || {},
  });
}
