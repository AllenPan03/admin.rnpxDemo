import request from '@/utils/request';
/**
 * 
 */;
export function detail(options = {}) {
  return request("backend/news/detail", {
    method: "get",
    params: options || {},
  });
}

/**
 * 
 */;
export function list(options = {}) {
  return request("backend/news/list", {
    method: "get",
    params: options || {},
  });
}

/**
 * 
 */;
export function delete_1(options = {}) {
  return request("backend/news/delete", {
    method: "post",
    data: options || {},
  });
}

/**
 * 
 */;
export function add(options = {}) {
  return request("backend/news/add", {
    method: "post",
    data: options || {},
  });
}

/**
 * 
 */;
export function update(options = {}) {
  return request("backend/news/update", {
    method: "post",
    data: options || {},
  });
}
