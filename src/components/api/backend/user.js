import request from '@/utils/request';
/**
 * 
 */;
export function login(options = {}) {
  return request("backend/user/login", {
    method: "post",
    data: options || {},
  });
}

/**
 * 
 */;
export function getUser(options = {}) {
  return request("backend/user/getUser", {
    method: "get",
    params: options || {},
  });
}
