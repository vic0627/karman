import CacheStrategy from "src/abstract/CacheStrategy.abstract";
import { CacheData } from "src/types/requestPipe.type";
import { Task } from "src/types/scheduledTask.type";
import { symbolToken } from "src/utils/common";

export default class WebStorage implements CacheStrategy {
  #heapList: string[] = [];

  set(requestToken: symbol, cacheData: CacheData) {
    const key = this.#getTokenString(requestToken);

    sessionStorage.setItem(key, JSON.stringify(cacheData));

    if (!this.#heapList.includes(key)) {
      this.#heapList.push(key);
      //   console.log("新增快取紀錄，目前總紀錄為：", this.#heapList);
    }
  }

  delete(requestToken: symbol): void {
    const key = this.#getTokenString(requestToken);

    const idx = this.#heapList.findIndex((val) => val === key);

    if (idx === -1) {
      return;
    }

    sessionStorage.removeItem(key);
    this.#heapList.splice(idx, 1);
    // console.log("快取清除：", key);
  }

  has(requestToken: symbol): boolean {
    const key = this.#getTokenString(requestToken);

    return !!sessionStorage[key] && this.#heapList.includes(key);
  }

  get(requestToken: symbol): CacheData {
    const key = this.#getTokenString(requestToken);
    let cache: string | undefined | CacheData = sessionStorage[key] || "{ expiration: 0 }";
    cache = JSON.parse(cache as string) as CacheData;
    // console.log("取得快取", cache);

    return cache;
  }

  clear(): void {
    this.#heapList.forEach((key) => {
      sessionStorage.removeItem(key);
    });

    this.#heapList = [];
  }

  scheduledTask: Task = (now) => {
    if (!this.#heapList.length) {
      return true;
    }

    this.#heapList.forEach((key) => {
      const token = symbolToken(key);
      const { expiration } = this.get(token);
      // console.log("快取檢查中...", key, now > expiration);

      if (now > expiration) {
        this.delete(token);
        // console.log("快取清除中...", now);
      }
    });

    return !this.#heapList.length;
  };

  #getTokenString(token: symbol) {
    let str = token.toString();
    str = str.replace("Symbol(", "");
    str = str.replace(")", "");

    return str;
  }
}
