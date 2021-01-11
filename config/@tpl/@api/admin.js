__api_annotation__;
export function __api_name__(options = {}) {
  return request(__url__, {
    method: __method__,
    __data__: options || {},
  });
}
