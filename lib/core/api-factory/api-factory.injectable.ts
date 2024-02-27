import RequestStrategy from "@/abstract/request-strategy.abstract";
import Xhr from "../request-strategy/xhr.injectable";
import TypeCheck from "@/utils/type-check.provider";
import Template from "@/utils/template.provider";
import { RuntimeOptions } from "@/types/karman/final-api.type";
import Karman from "../karman/karman";

export default class ApiFactory {
  constructor(
    private readonly template: Template,
    private readonly typeCheck: TypeCheck,
    private readonly xhr: Xhr,
  ) {}

  private request(payload: Record<string, any>, runtimeOptions: RuntimeOptions) {
    const self = this as unknown as Karman;

    self.
  }
}
