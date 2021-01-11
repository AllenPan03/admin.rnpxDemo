import request from '@/utils/request';
/**
 * 
 */;
export function list(options = {}) {
  return request("backend/message/list", {
    method: "get",
    params: options || {},
  });
}
