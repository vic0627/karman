// import * as _ from "lodash";

declare const _: typeof import("lodash");

export function configInherit<O extends object>(baseObj: O, ...objs: O[]): O {
  const copy = _.cloneDeep(baseObj);
  const combination = _.merge(copy, ...objs);

  return combination;
}
