/**
 * ⚠️零散的共用邏輯可以放這，若有兩支以上的函式都在處理同系列邏輯，請將那些邏輯獨立出去成 provider⚠️
 *
 * @todo 新增 `Object.provider.ts` 用於更安全地處理物件複雜操作
 */

/** 不是空值(`null` or `undefined`) */
export const notNull = (value: unknown): boolean => value !== null && value !== undefined;

export const symbolToken = <T extends string>(target: T) => Symbol.for(target);

export const deepCloneFunction = (fn: Function) => new Function("return " + fn.toString())() as Function;

export const pureLowerCase = <T extends string>(str: T) => /^[a-z]+$/.test(str);

export const getRanNum = (type: "string" | "number" = "number") => {
  const ran = Math.random();

  if (type === "number") {
    return ran;
  } else if (type === "string") {
    return ran.toString();
  }

  throw new Error("Get random number failed");
};

export const mergeObject = (...targets: any[]) => {
  const newObject: any = {};

  for (const o of targets) {
    for (const key in o) {
      if (!Object.prototype.hasOwnProperty.call(o, key)) {
        continue;
      }

      const value = o[key];

      Object.defineProperty(newObject, key, {
        value,
        enumerable: true,
        configurable: true,
        writable: true,
      });
    }
  }

  return newObject;
};

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
export const deepClone = <T extends unknown | unknown[]>(source: T) => {
  if (typeof source !== "object" || source === null) {
    return source;
  }

  const target = Array.isArray(source) ? ([] as T) : ({} as T);

  for (const key in source) {
    if (!Object.prototype.hasOwnProperty.call(source, key)) {
      continue;
    }

    if (typeof source[key] === "object" && source[key] !== null) {
      target[key] = deepClone(source[key]);
    } else {
      target[key] = source[key];
    }
  }

  return target;
};
