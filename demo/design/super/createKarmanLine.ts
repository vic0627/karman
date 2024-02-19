import Karman from "src/core/karman/Karman";
import { ConstructorOf } from "src/types/karman/common.type";

interface Options<T> {
    karman: ConstructorOf<T>;
    baseURL: string;
}

const createKarmanLine = <T>(option: Options<T>) => {
  const { karman, baseURL } = option;

  if (Object.getPrototypeOf(karman) === Karman) {
    const instance = new karman(baseURL);

    return instance;
  }
};

export default createKarmanLine;
