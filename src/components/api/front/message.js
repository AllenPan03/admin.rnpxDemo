import request from '@/utils/request';
/**
 * 
 */;
export function submit(options = {}) {
  return request("front/message/submit", {
    method: "post",
    data: options || {},
  });
}
