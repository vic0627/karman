import { cloneDeep, merge } from "lodash-es";

export function configInherit<O extends object>(baseObj: O, ...objs: O[]): O {
  const copy = cloneDeep(baseObj);
  const combination = merge(copy, ...objs);

  return combination;
}
