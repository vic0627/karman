import IOCContainer from "@/decorator/IOCContainer.decorator";
import MemoryCache from "./api-factory/request-pipe/cache-strategy/memory-cache.provider";
import CachePipe from "./api-factory/request-pipe/cache-pipe.injectable";
import ApiFactory from "./api-factory/api-factory.injectable";
import LayerBuilder from "./layer-builder/layer-builder.injectable";
import Xhr from "./request-strategy/xhr.injectable";
import ScheduledTask from "./scheduled-task/scheduled-task.injectable";
import FunctionalValidator from "./validation-engine/validators/functional-validator.injectable";
import ParameterDescriptorValidator from "./validation-engine/validators/parameter-descriptor-validator.injectable";
import RegExpValidator from "./validation-engine/validators/regexp-validator.provider";
import TypeValidator from "./validation-engine/validators/type-validator.injectable";
import ValidationEngine from "./validation-engine/validation-engine.injectable";
import PathResolver from "@/utils/path-resolver.provider";
import TypeCheck from "@/utils/type-check.provider";
import Template from "@/utils/template.provider";
import LocalStorageCache from "./api-factory/request-pipe/cache-strategy/local-storage-cache.provider";
import SessionStorageCache from "./api-factory/request-pipe/cache-strategy/session-storage-cache.provider";
import Fetch from "./request-strategy/fetch.injectable";

@IOCContainer({
  imports: [
    CachePipe,
    ApiFactory,
    LayerBuilder,
    Xhr,
    Fetch,
    ScheduledTask,
    FunctionalValidator,
    ParameterDescriptorValidator,
    RegExpValidator,
    TypeValidator,
    ValidationEngine,
  ],
  provides: [MemoryCache, LocalStorageCache, SessionStorageCache, PathResolver, TypeCheck, Template],
  exports: [ApiFactory, LayerBuilder, ValidationEngine],
})
export default class {
  ApiFactory!: ApiFactory;
  LayerBuilder!: LayerBuilder;
  ValidationEngine!: ValidationEngine;
}
