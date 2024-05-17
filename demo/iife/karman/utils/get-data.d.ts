type ResObj<D> = {
  data?: D;
  body?: D;
};

type ValidData = string | number | boolean | object | symbol | bigint;

export default function getData<T>(
  res: T,
): T["body"] extends ValidData ? T["body"] : T["data"] extends ValidData ? T["data"] : "no data";

declare module "../../../../dist/karman" {
  interface KarmanDependencies {
    /**
     * get data from response object
     */
    _getData: typeof getData;
  }
}