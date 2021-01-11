import request from '@/utils/request';
/**
 * 
 */;
export function list(options = {}) {
  return request("front/file/list", {
    method: "get",
    params: options || {},
  });
}
