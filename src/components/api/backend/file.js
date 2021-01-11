import request from '@/utils/request';
/**
 * 
 */;
export function upload(options = {}) {
  return request("backend/file/upload", {
    method: "post",
    data: options || {}
  });
}

/**
 * 
 */;
export function list(options = {}) {
  return request("backend/file/list", {
    method: "get",
    params: options || {},
  });
}

/**
 * 
 */;
export function delete_1(options = {}) {
  return request("backend/file/delete", {
    method: "post",
    data: options || {},
  });
}

/**
 * 
 */;
export function add(options = {}) {
  return request("backend/file/add", {
    method: "post",
    data: options || {},
  });
}
