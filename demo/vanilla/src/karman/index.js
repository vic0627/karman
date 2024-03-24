var Reflect$1;
(function (Reflect) {
  (function (factory) {
    var root = typeof global === "object" ? global : typeof self === "object" ? self : typeof this === "object" ? this : Function("return this;")();
    var exporter = makeExporter(Reflect);
    if (typeof root.Reflect === "undefined") {
      root.Reflect = Reflect;
    } else {
      exporter = makeExporter(root.Reflect, exporter);
    }
    factory(exporter);
    function makeExporter(target, previous) {
      return function (key, value) {
        if (typeof target[key] !== "function") {
          Object.defineProperty(target, key, {
            configurable: true,
            writable: true,
            value: value
          });
        }
        if (previous) previous(key, value);
      };
    }
  })(function (exporter) {
    var hasOwn = Object.prototype.hasOwnProperty;
    var supportsSymbol = typeof Symbol === "function";
    var toPrimitiveSymbol = supportsSymbol && typeof Symbol.toPrimitive !== "undefined" ? Symbol.toPrimitive : "@@toPrimitive";
    var iteratorSymbol = supportsSymbol && typeof Symbol.iterator !== "undefined" ? Symbol.iterator : "@@iterator";
    var supportsCreate = typeof Object.create === "function";
    var supportsProto = {
      __proto__: []
    } instanceof Array;
    var downLevel = !supportsCreate && !supportsProto;
    var HashMap = {
      create: supportsCreate ? function () {
        return MakeDictionary(Object.create(null));
      } : supportsProto ? function () {
        return MakeDictionary({
          __proto__: null
        });
      } : function () {
        return MakeDictionary({});
      },
      has: downLevel ? function (map, key) {
        return hasOwn.call(map, key);
      } : function (map, key) {
        return key in map;
      },
      get: downLevel ? function (map, key) {
        return hasOwn.call(map, key) ? map[key] : undefined;
      } : function (map, key) {
        return map[key];
      }
    };
    var functionPrototype = Object.getPrototypeOf(Function);
    var usePolyfill = typeof process === "object" && process["env" + ""] && process["env" + ""]["REFLECT_METADATA_USE_MAP_POLYFILL"] === "true";
    var _Map = !usePolyfill && typeof Map === "function" && typeof Map.prototype.entries === "function" ? Map : CreateMapPolyfill();
    var _Set = !usePolyfill && typeof Set === "function" && typeof Set.prototype.entries === "function" ? Set : CreateSetPolyfill();
    var _WeakMap = !usePolyfill && typeof WeakMap === "function" ? WeakMap : CreateWeakMapPolyfill();
    var Metadata = new _WeakMap();
    function decorate(decorators, target, propertyKey, attributes) {
      if (!IsUndefined(propertyKey)) {
        if (!IsArray(decorators)) throw new TypeError();
        if (!IsObject(target)) throw new TypeError();
        if (!IsObject(attributes) && !IsUndefined(attributes) && !IsNull(attributes)) throw new TypeError();
        if (IsNull(attributes)) attributes = undefined;
        propertyKey = ToPropertyKey(propertyKey);
        return DecorateProperty(decorators, target, propertyKey, attributes);
      } else {
        if (!IsArray(decorators)) throw new TypeError();
        if (!IsConstructor(target)) throw new TypeError();
        return DecorateConstructor(decorators, target);
      }
    }
    exporter("decorate", decorate);
    function metadata(metadataKey, metadataValue) {
      function decorator(target, propertyKey) {
        if (!IsObject(target)) throw new TypeError();
        if (!IsUndefined(propertyKey) && !IsPropertyKey(propertyKey)) throw new TypeError();
        OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
      }
      return decorator;
    }
    exporter("metadata", metadata);
    function defineMetadata(metadataKey, metadataValue, target, propertyKey) {
      if (!IsObject(target)) throw new TypeError();
      if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey);
      return OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
    }
    exporter("defineMetadata", defineMetadata);
    function hasMetadata(metadataKey, target, propertyKey) {
      if (!IsObject(target)) throw new TypeError();
      if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey);
      return OrdinaryHasMetadata(metadataKey, target, propertyKey);
    }
    exporter("hasMetadata", hasMetadata);
    function hasOwnMetadata(metadataKey, target, propertyKey) {
      if (!IsObject(target)) throw new TypeError();
      if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey);
      return OrdinaryHasOwnMetadata(metadataKey, target, propertyKey);
    }
    exporter("hasOwnMetadata", hasOwnMetadata);
    function getMetadata(metadataKey, target, propertyKey) {
      if (!IsObject(target)) throw new TypeError();
      if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey);
      return OrdinaryGetMetadata(metadataKey, target, propertyKey);
    }
    exporter("getMetadata", getMetadata);
    function getOwnMetadata(metadataKey, target, propertyKey) {
      if (!IsObject(target)) throw new TypeError();
      if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey);
      return OrdinaryGetOwnMetadata(metadataKey, target, propertyKey);
    }
    exporter("getOwnMetadata", getOwnMetadata);
    function getMetadataKeys(target, propertyKey) {
      if (!IsObject(target)) throw new TypeError();
      if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey);
      return OrdinaryMetadataKeys(target, propertyKey);
    }
    exporter("getMetadataKeys", getMetadataKeys);
    function getOwnMetadataKeys(target, propertyKey) {
      if (!IsObject(target)) throw new TypeError();
      if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey);
      return OrdinaryOwnMetadataKeys(target, propertyKey);
    }
    exporter("getOwnMetadataKeys", getOwnMetadataKeys);
    function deleteMetadata(metadataKey, target, propertyKey) {
      if (!IsObject(target)) throw new TypeError();
      if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey);
      var metadataMap = GetOrCreateMetadataMap(target, propertyKey, false);
      if (IsUndefined(metadataMap)) return false;
      if (!metadataMap.delete(metadataKey)) return false;
      if (metadataMap.size > 0) return true;
      var targetMetadata = Metadata.get(target);
      targetMetadata.delete(propertyKey);
      if (targetMetadata.size > 0) return true;
      Metadata.delete(target);
      return true;
    }
    exporter("deleteMetadata", deleteMetadata);
    function DecorateConstructor(decorators, target) {
      for (var i = decorators.length - 1; i >= 0; --i) {
        var decorator = decorators[i];
        var decorated = decorator(target);
        if (!IsUndefined(decorated) && !IsNull(decorated)) {
          if (!IsConstructor(decorated)) throw new TypeError();
          target = decorated;
        }
      }
      return target;
    }
    function DecorateProperty(decorators, target, propertyKey, descriptor) {
      for (var i = decorators.length - 1; i >= 0; --i) {
        var decorator = decorators[i];
        var decorated = decorator(target, propertyKey, descriptor);
        if (!IsUndefined(decorated) && !IsNull(decorated)) {
          if (!IsObject(decorated)) throw new TypeError();
          descriptor = decorated;
        }
      }
      return descriptor;
    }
    function GetOrCreateMetadataMap(O, P, Create) {
      var targetMetadata = Metadata.get(O);
      if (IsUndefined(targetMetadata)) {
        if (!Create) return undefined;
        targetMetadata = new _Map();
        Metadata.set(O, targetMetadata);
      }
      var metadataMap = targetMetadata.get(P);
      if (IsUndefined(metadataMap)) {
        if (!Create) return undefined;
        metadataMap = new _Map();
        targetMetadata.set(P, metadataMap);
      }
      return metadataMap;
    }
    function OrdinaryHasMetadata(MetadataKey, O, P) {
      var hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P);
      if (hasOwn) return true;
      var parent = OrdinaryGetPrototypeOf(O);
      if (!IsNull(parent)) return OrdinaryHasMetadata(MetadataKey, parent, P);
      return false;
    }
    function OrdinaryHasOwnMetadata(MetadataKey, O, P) {
      var metadataMap = GetOrCreateMetadataMap(O, P, false);
      if (IsUndefined(metadataMap)) return false;
      return ToBoolean(metadataMap.has(MetadataKey));
    }
    function OrdinaryGetMetadata(MetadataKey, O, P) {
      var hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P);
      if (hasOwn) return OrdinaryGetOwnMetadata(MetadataKey, O, P);
      var parent = OrdinaryGetPrototypeOf(O);
      if (!IsNull(parent)) return OrdinaryGetMetadata(MetadataKey, parent, P);
      return undefined;
    }
    function OrdinaryGetOwnMetadata(MetadataKey, O, P) {
      var metadataMap = GetOrCreateMetadataMap(O, P, false);
      if (IsUndefined(metadataMap)) return undefined;
      return metadataMap.get(MetadataKey);
    }
    function OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P) {
      var metadataMap = GetOrCreateMetadataMap(O, P, true);
      metadataMap.set(MetadataKey, MetadataValue);
    }
    function OrdinaryMetadataKeys(O, P) {
      var ownKeys = OrdinaryOwnMetadataKeys(O, P);
      var parent = OrdinaryGetPrototypeOf(O);
      if (parent === null) return ownKeys;
      var parentKeys = OrdinaryMetadataKeys(parent, P);
      if (parentKeys.length <= 0) return ownKeys;
      if (ownKeys.length <= 0) return parentKeys;
      var set = new _Set();
      var keys = [];
      for (var _i = 0, ownKeys_1 = ownKeys; _i < ownKeys_1.length; _i++) {
        var key = ownKeys_1[_i];
        var hasKey = set.has(key);
        if (!hasKey) {
          set.add(key);
          keys.push(key);
        }
      }
      for (var _a = 0, parentKeys_1 = parentKeys; _a < parentKeys_1.length; _a++) {
        var key = parentKeys_1[_a];
        var hasKey = set.has(key);
        if (!hasKey) {
          set.add(key);
          keys.push(key);
        }
      }
      return keys;
    }
    function OrdinaryOwnMetadataKeys(O, P) {
      var keys = [];
      var metadataMap = GetOrCreateMetadataMap(O, P, false);
      if (IsUndefined(metadataMap)) return keys;
      var keysObj = metadataMap.keys();
      var iterator = GetIterator(keysObj);
      var k = 0;
      while (true) {
        var next = IteratorStep(iterator);
        if (!next) {
          keys.length = k;
          return keys;
        }
        var nextValue = IteratorValue(next);
        try {
          keys[k] = nextValue;
        } catch (e) {
          try {
            IteratorClose(iterator);
          } finally {
            throw e;
          }
        }
        k++;
      }
    }
    function Type(x) {
      if (x === null) return 1 ;
      switch (typeof x) {
        case "undefined":
          return 0 ;
        case "boolean":
          return 2 ;
        case "string":
          return 3 ;
        case "symbol":
          return 4 ;
        case "number":
          return 5 ;
        case "object":
          return x === null ? 1  : 6 ;
        default:
          return 6 ;
      }
    }
    function IsUndefined(x) {
      return x === undefined;
    }
    function IsNull(x) {
      return x === null;
    }
    function IsSymbol(x) {
      return typeof x === "symbol";
    }
    function IsObject(x) {
      return typeof x === "object" ? x !== null : typeof x === "function";
    }
    function ToPrimitive(input, PreferredType) {
      switch (Type(input)) {
        case 0 :
          return input;
        case 1 :
          return input;
        case 2 :
          return input;
        case 3 :
          return input;
        case 4 :
          return input;
        case 5 :
          return input;
      }
      var hint = PreferredType === 3  ? "string" : PreferredType === 5  ? "number" : "default";
      var exoticToPrim = GetMethod(input, toPrimitiveSymbol);
      if (exoticToPrim !== undefined) {
        var result = exoticToPrim.call(input, hint);
        if (IsObject(result)) throw new TypeError();
        return result;
      }
      return OrdinaryToPrimitive(input, hint === "default" ? "number" : hint);
    }
    function OrdinaryToPrimitive(O, hint) {
      if (hint === "string") {
        var toString_1 = O.toString;
        if (IsCallable(toString_1)) {
          var result = toString_1.call(O);
          if (!IsObject(result)) return result;
        }
        var valueOf = O.valueOf;
        if (IsCallable(valueOf)) {
          var result = valueOf.call(O);
          if (!IsObject(result)) return result;
        }
      } else {
        var valueOf = O.valueOf;
        if (IsCallable(valueOf)) {
          var result = valueOf.call(O);
          if (!IsObject(result)) return result;
        }
        var toString_2 = O.toString;
        if (IsCallable(toString_2)) {
          var result = toString_2.call(O);
          if (!IsObject(result)) return result;
        }
      }
      throw new TypeError();
    }
    function ToBoolean(argument) {
      return !!argument;
    }
    function ToString(argument) {
      return "" + argument;
    }
    function ToPropertyKey(argument) {
      var key = ToPrimitive(argument, 3 );
      if (IsSymbol(key)) return key;
      return ToString(key);
    }
    function IsArray(argument) {
      return Array.isArray ? Array.isArray(argument) : argument instanceof Object ? argument instanceof Array : Object.prototype.toString.call(argument) === "[object Array]";
    }
    function IsCallable(argument) {
      return typeof argument === "function";
    }
    function IsConstructor(argument) {
      return typeof argument === "function";
    }
    function IsPropertyKey(argument) {
      switch (Type(argument)) {
        case 3 :
          return true;
        case 4 :
          return true;
        default:
          return false;
      }
    }
    function GetMethod(V, P) {
      var func = V[P];
      if (func === undefined || func === null) return undefined;
      if (!IsCallable(func)) throw new TypeError();
      return func;
    }
    function GetIterator(obj) {
      var method = GetMethod(obj, iteratorSymbol);
      if (!IsCallable(method)) throw new TypeError();
      var iterator = method.call(obj);
      if (!IsObject(iterator)) throw new TypeError();
      return iterator;
    }
    function IteratorValue(iterResult) {
      return iterResult.value;
    }
    function IteratorStep(iterator) {
      var result = iterator.next();
      return result.done ? false : result;
    }
    function IteratorClose(iterator) {
      var f = iterator["return"];
      if (f) f.call(iterator);
    }
    function OrdinaryGetPrototypeOf(O) {
      var proto = Object.getPrototypeOf(O);
      if (typeof O !== "function" || O === functionPrototype) return proto;
      if (proto !== functionPrototype) return proto;
      var prototype = O.prototype;
      var prototypeProto = prototype && Object.getPrototypeOf(prototype);
      if (prototypeProto == null || prototypeProto === Object.prototype) return proto;
      var constructor = prototypeProto.constructor;
      if (typeof constructor !== "function") return proto;
      if (constructor === O) return proto;
      return constructor;
    }
    function CreateMapPolyfill() {
      var cacheSentinel = {};
      var arraySentinel = [];
      var MapIterator = function () {
        function MapIterator(keys, values, selector) {
          this._index = 0;
          this._keys = keys;
          this._values = values;
          this._selector = selector;
        }
        MapIterator.prototype["@@iterator"] = function () {
          return this;
        };
        MapIterator.prototype[iteratorSymbol] = function () {
          return this;
        };
        MapIterator.prototype.next = function () {
          var index = this._index;
          if (index >= 0 && index < this._keys.length) {
            var result = this._selector(this._keys[index], this._values[index]);
            if (index + 1 >= this._keys.length) {
              this._index = -1;
              this._keys = arraySentinel;
              this._values = arraySentinel;
            } else {
              this._index++;
            }
            return {
              value: result,
              done: false
            };
          }
          return {
            value: undefined,
            done: true
          };
        };
        MapIterator.prototype.throw = function (error) {
          if (this._index >= 0) {
            this._index = -1;
            this._keys = arraySentinel;
            this._values = arraySentinel;
          }
          throw error;
        };
        MapIterator.prototype.return = function (value) {
          if (this._index >= 0) {
            this._index = -1;
            this._keys = arraySentinel;
            this._values = arraySentinel;
          }
          return {
            value: value,
            done: true
          };
        };
        return MapIterator;
      }();
      return function () {
        function Map() {
          this._keys = [];
          this._values = [];
          this._cacheKey = cacheSentinel;
          this._cacheIndex = -2;
        }
        Object.defineProperty(Map.prototype, "size", {
          get: function () {
            return this._keys.length;
          },
          enumerable: true,
          configurable: true
        });
        Map.prototype.has = function (key) {
          return this._find(key, false) >= 0;
        };
        Map.prototype.get = function (key) {
          var index = this._find(key, false);
          return index >= 0 ? this._values[index] : undefined;
        };
        Map.prototype.set = function (key, value) {
          var index = this._find(key, true);
          this._values[index] = value;
          return this;
        };
        Map.prototype.delete = function (key) {
          var index = this._find(key, false);
          if (index >= 0) {
            var size = this._keys.length;
            for (var i = index + 1; i < size; i++) {
              this._keys[i - 1] = this._keys[i];
              this._values[i - 1] = this._values[i];
            }
            this._keys.length--;
            this._values.length--;
            if (key === this._cacheKey) {
              this._cacheKey = cacheSentinel;
              this._cacheIndex = -2;
            }
            return true;
          }
          return false;
        };
        Map.prototype.clear = function () {
          this._keys.length = 0;
          this._values.length = 0;
          this._cacheKey = cacheSentinel;
          this._cacheIndex = -2;
        };
        Map.prototype.keys = function () {
          return new MapIterator(this._keys, this._values, getKey);
        };
        Map.prototype.values = function () {
          return new MapIterator(this._keys, this._values, getValue);
        };
        Map.prototype.entries = function () {
          return new MapIterator(this._keys, this._values, getEntry);
        };
        Map.prototype["@@iterator"] = function () {
          return this.entries();
        };
        Map.prototype[iteratorSymbol] = function () {
          return this.entries();
        };
        Map.prototype._find = function (key, insert) {
          if (this._cacheKey !== key) {
            this._cacheIndex = this._keys.indexOf(this._cacheKey = key);
          }
          if (this._cacheIndex < 0 && insert) {
            this._cacheIndex = this._keys.length;
            this._keys.push(key);
            this._values.push(undefined);
          }
          return this._cacheIndex;
        };
        return Map;
      }();
      function getKey(key, _) {
        return key;
      }
      function getValue(_, value) {
        return value;
      }
      function getEntry(key, value) {
        return [key, value];
      }
    }
    function CreateSetPolyfill() {
      return function () {
        function Set() {
          this._map = new _Map();
        }
        Object.defineProperty(Set.prototype, "size", {
          get: function () {
            return this._map.size;
          },
          enumerable: true,
          configurable: true
        });
        Set.prototype.has = function (value) {
          return this._map.has(value);
        };
        Set.prototype.add = function (value) {
          return this._map.set(value, value), this;
        };
        Set.prototype.delete = function (value) {
          return this._map.delete(value);
        };
        Set.prototype.clear = function () {
          this._map.clear();
        };
        Set.prototype.keys = function () {
          return this._map.keys();
        };
        Set.prototype.values = function () {
          return this._map.values();
        };
        Set.prototype.entries = function () {
          return this._map.entries();
        };
        Set.prototype["@@iterator"] = function () {
          return this.keys();
        };
        Set.prototype[iteratorSymbol] = function () {
          return this.keys();
        };
        return Set;
      }();
    }
    function CreateWeakMapPolyfill() {
      var UUID_SIZE = 16;
      var keys = HashMap.create();
      var rootKey = CreateUniqueKey();
      return function () {
        function WeakMap() {
          this._key = CreateUniqueKey();
        }
        WeakMap.prototype.has = function (target) {
          var table = GetOrCreateWeakMapTable(target, false);
          return table !== undefined ? HashMap.has(table, this._key) : false;
        };
        WeakMap.prototype.get = function (target) {
          var table = GetOrCreateWeakMapTable(target, false);
          return table !== undefined ? HashMap.get(table, this._key) : undefined;
        };
        WeakMap.prototype.set = function (target, value) {
          var table = GetOrCreateWeakMapTable(target, true);
          table[this._key] = value;
          return this;
        };
        WeakMap.prototype.delete = function (target) {
          var table = GetOrCreateWeakMapTable(target, false);
          return table !== undefined ? delete table[this._key] : false;
        };
        WeakMap.prototype.clear = function () {
          this._key = CreateUniqueKey();
        };
        return WeakMap;
      }();
      function CreateUniqueKey() {
        var key;
        do key = "@@WeakMap@@" + CreateUUID(); while (HashMap.has(keys, key));
        keys[key] = true;
        return key;
      }
      function GetOrCreateWeakMapTable(target, create) {
        if (!hasOwn.call(target, rootKey)) {
          if (!create) return undefined;
          Object.defineProperty(target, rootKey, {
            value: HashMap.create()
          });
        }
        return target[rootKey];
      }
      function FillRandomBytes(buffer, size) {
        for (var i = 0; i < size; ++i) buffer[i] = Math.random() * 0xff | 0;
        return buffer;
      }
      function GenRandomBytes(size) {
        if (typeof Uint8Array === "function") {
          if (typeof crypto !== "undefined") return crypto.getRandomValues(new Uint8Array(size));
          if (typeof msCrypto !== "undefined") return msCrypto.getRandomValues(new Uint8Array(size));
          return FillRandomBytes(new Uint8Array(size), size);
        }
        return FillRandomBytes(new Array(size), size);
      }
      function CreateUUID() {
        var data = GenRandomBytes(UUID_SIZE);
        data[6] = data[6] & 0x4f | 0x40;
        data[8] = data[8] & 0xbf | 0x80;
        var result = "";
        for (var offset = 0; offset < UUID_SIZE; ++offset) {
          var byte = data[offset];
          if (offset === 4 || offset === 6 || offset === 8) result += "-";
          if (byte < 16) result += "0";
          result += byte.toString(16).toLowerCase();
        }
        return result;
      }
    }
    function MakeDictionary(obj) {
      obj.__ = undefined;
      delete obj.__;
      return obj;
    }
  });
})(Reflect$1 || (Reflect$1 = {}));

function __decorate(decorators, target, key, desc) {
  var c = arguments.length,
    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
    d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function __metadata(metadataKey, metadataValue) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}
typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

const META_PARAMTYPES = "design:paramtypes";

function IOCContainer(options = {}) {
  const {
    provides,
    imports,
    exports = []
  } = options;
  const exposeModules = new Map();
  const getExport = value => {
    for (const prototype of exports) {
      if (value instanceof prototype) exposeModules.set(prototype.name, value);
    }
  };
  return target => {
    const providers = provides?.map(slice => {
      const value = new slice();
      getExport(value);
      return [Symbol.for(slice.toString()), value];
    }) ?? [];
    const importers = imports?.map(slice => {
      const token = Symbol.for(slice.toString());
      const deps = Reflect.getMetadata(META_PARAMTYPES, slice) ?? [];
      const requirements = deps.map(dep => Symbol.for(dep.toString()));
      return [token, {
        constructor: slice,
        requirements
      }];
    }) ?? [];
    const targetDep = Reflect.getMetadata(META_PARAMTYPES, target) ?? [];
    const targetDepToken = targetDep?.map(dep => Symbol.for(dep.toString())) ?? [];
    const instances = new Map(providers);
    const queue = new Map(importers);
    while (queue.size) {
      const cacheSize = queue.size;
      queue.forEach(({
        constructor,
        requirements
      }, token) => {
        const deps = [];
        let stop = false;
        for (const token of requirements) {
          const dep = instances.get(token);
          if (!dep) {
            stop = true;
            break;
          }
          deps.push(dep);
        }
        if (stop) {
          return;
        }
        const value = new constructor(...(deps || []));
        getExport(value);
        instances.set(token, value);
        queue.delete(token);
      });
      if (cacheSize === queue.size) {
        console.warn("Missing dependency...");
        break;
      }
    }
    return class IoC extends target {
      constructor(...args) {
        const injections = targetDepToken.map(token => {
          const dep = instances.get(token);
          if (dep) {
            return dep;
          }
          throw new Error("Missing dependency.");
        });
        super(...injections);
        exposeModules.forEach((value, name) => {
          Object.defineProperty(this, name, {
            value
          });
        });
      }
    };
  };
}

class MemoryCache {
  name = "memory";
  store = new Map();
  set(requestKey, cacheData) {
    this.store.set(requestKey, cacheData);
  }
  delete(requestKey) {
    this.store.delete(requestKey);
  }
  has(requestKey) {
    return this.store.has(requestKey);
  }
  get(requestKey) {
    const data = this.store.get(requestKey);
    const existed = this.checkExpiration(requestKey, data);
    if (existed) return data;
  }
  clear() {
    this.store.clear();
  }
  scheduledTask(now) {
    this.store.forEach((cache, key, map) => {
      if (now > cache.expiration) map.delete(key);
    });
    return !this.store.size;
  }
  checkExpiration(requestKey, cacheData) {
    if (!cacheData) return false;
    if (Date.now() > cacheData.expiration) {
      return !this.store.delete(requestKey);
    }
    return true;
  }
}

function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}

function eq(value, other) {
  return value === other || value !== value && other !== other;
}

function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

var arrayProto = Array.prototype;
var splice = arrayProto.splice;
function listCacheDelete(key) {
  var data = this.__data__,
    index = assocIndexOf(data, key);
  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  --this.size;
  return true;
}

function listCacheGet(key) {
  var data = this.__data__,
    index = assocIndexOf(data, key);
  return index < 0 ? undefined : data[index][1];
}

function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

function listCacheSet(key, value) {
  var data = this.__data__,
    index = assocIndexOf(data, key);
  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

function ListCache(entries) {
  var index = -1,
    length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

function stackClear() {
  this.__data__ = new ListCache();
  this.size = 0;
}

function stackDelete(key) {
  var data = this.__data__,
    result = data['delete'](key);
  this.size = data.size;
  return result;
}

function stackGet(key) {
  return this.__data__.get(key);
}

function stackHas(key) {
  return this.__data__.has(key);
}

var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

var freeSelf = typeof self == 'object' && self && self.Object === Object && self;
var root = freeGlobal || freeSelf || Function('return this')();

var Symbol$1 = root.Symbol;

var objectProto$f = Object.prototype;
var hasOwnProperty$c = objectProto$f.hasOwnProperty;
var nativeObjectToString$1 = objectProto$f.toString;
var symToStringTag$1 = Symbol$1 ? Symbol$1.toStringTag : undefined;
function getRawTag(value) {
  var isOwn = hasOwnProperty$c.call(value, symToStringTag$1),
    tag = value[symToStringTag$1];
  try {
    value[symToStringTag$1] = undefined;
    var unmasked = true;
  } catch (e) {}
  var result = nativeObjectToString$1.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag$1] = tag;
    } else {
      delete value[symToStringTag$1];
    }
  }
  return result;
}

var objectProto$e = Object.prototype;
var nativeObjectToString = objectProto$e.toString;
function objectToString(value) {
  return nativeObjectToString.call(value);
}

var nullTag = '[object Null]',
  undefinedTag = '[object Undefined]';
var symToStringTag = Symbol$1 ? Symbol$1.toStringTag : undefined;
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
}

function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

var asyncTag = '[object AsyncFunction]',
  funcTag$2 = '[object Function]',
  genTag$1 = '[object GeneratorFunction]',
  proxyTag = '[object Proxy]';
function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }
  var tag = baseGetTag(value);
  return tag == funcTag$2 || tag == genTag$1 || tag == asyncTag || tag == proxyTag;
}

var coreJsData = root['__core-js_shared__'];

var maskSrcKey = function () {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? 'Symbol(src)_1.' + uid : '';
}();
function isMasked(func) {
  return !!maskSrcKey && maskSrcKey in func;
}

var funcProto$2 = Function.prototype;
var funcToString$2 = funcProto$2.toString;
function toSource(func) {
  if (func != null) {
    try {
      return funcToString$2.call(func);
    } catch (e) {}
    try {
      return func + '';
    } catch (e) {}
  }
  return '';
}

var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
var reIsHostCtor = /^\[object .+?Constructor\]$/;
var funcProto$1 = Function.prototype,
  objectProto$d = Object.prototype;
var funcToString$1 = funcProto$1.toString;
var hasOwnProperty$b = objectProto$d.hasOwnProperty;
var reIsNative = RegExp('^' + funcToString$1.call(hasOwnProperty$b).replace(reRegExpChar, '\\$&').replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$');
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

function getValue(object, key) {
  return object == null ? undefined : object[key];
}

function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

var Map$1 = getNative(root, 'Map');

var nativeCreate = getNative(Object, 'create');

function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
  this.size = 0;
}

function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}

var HASH_UNDEFINED$2 = '__lodash_hash_undefined__';
var objectProto$c = Object.prototype;
var hasOwnProperty$a = objectProto$c.hasOwnProperty;
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED$2 ? undefined : result;
  }
  return hasOwnProperty$a.call(data, key) ? data[key] : undefined;
}

var objectProto$b = Object.prototype;
var hasOwnProperty$9 = objectProto$b.hasOwnProperty;
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? data[key] !== undefined : hasOwnProperty$9.call(data, key);
}

var HASH_UNDEFINED$1 = '__lodash_hash_undefined__';
function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = nativeCreate && value === undefined ? HASH_UNDEFINED$1 : value;
  return this;
}

function Hash(entries) {
  var index = -1,
    length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    'hash': new Hash(),
    'map': new (Map$1 || ListCache)(),
    'string': new Hash()
  };
}

function isKeyable(value) {
  var type = typeof value;
  return type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean' ? value !== '__proto__' : value === null;
}

function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key) ? data[typeof key == 'string' ? 'string' : 'hash'] : data.map;
}

function mapCacheDelete(key) {
  var result = getMapData(this, key)['delete'](key);
  this.size -= result ? 1 : 0;
  return result;
}

function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

function mapCacheSet(key, value) {
  var data = getMapData(this, key),
    size = data.size;
  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}

function MapCache(entries) {
  var index = -1,
    length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

var LARGE_ARRAY_SIZE = 200;
function stackSet(key, value) {
  var data = this.__data__;
  if (data instanceof ListCache) {
    var pairs = data.__data__;
    if (!Map$1 || pairs.length < LARGE_ARRAY_SIZE - 1) {
      pairs.push([key, value]);
      this.size = ++data.size;
      return this;
    }
    data = this.__data__ = new MapCache(pairs);
  }
  data.set(key, value);
  this.size = data.size;
  return this;
}

function Stack(entries) {
  var data = this.__data__ = new ListCache(entries);
  this.size = data.size;
}
Stack.prototype.clear = stackClear;
Stack.prototype['delete'] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;

var HASH_UNDEFINED = '__lodash_hash_undefined__';
function setCacheAdd(value) {
  this.__data__.set(value, HASH_UNDEFINED);
  return this;
}

function setCacheHas(value) {
  return this.__data__.has(value);
}

function SetCache(values) {
  var index = -1,
    length = values == null ? 0 : values.length;
  this.__data__ = new MapCache();
  while (++index < length) {
    this.add(values[index]);
  }
}
SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
SetCache.prototype.has = setCacheHas;

function arraySome(array, predicate) {
  var index = -1,
    length = array == null ? 0 : array.length;
  while (++index < length) {
    if (predicate(array[index], index, array)) {
      return true;
    }
  }
  return false;
}

function cacheHas(cache, key) {
  return cache.has(key);
}

var COMPARE_PARTIAL_FLAG$3 = 1,
  COMPARE_UNORDERED_FLAG$1 = 2;
function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG$3,
    arrLength = array.length,
    othLength = other.length;
  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
    return false;
  }
  var arrStacked = stack.get(array);
  var othStacked = stack.get(other);
  if (arrStacked && othStacked) {
    return arrStacked == other && othStacked == array;
  }
  var index = -1,
    result = true,
    seen = bitmask & COMPARE_UNORDERED_FLAG$1 ? new SetCache() : undefined;
  stack.set(array, other);
  stack.set(other, array);
  while (++index < arrLength) {
    var arrValue = array[index],
      othValue = other[index];
    if (customizer) {
      var compared = isPartial ? customizer(othValue, arrValue, index, other, array, stack) : customizer(arrValue, othValue, index, array, other, stack);
    }
    if (compared !== undefined) {
      if (compared) {
        continue;
      }
      result = false;
      break;
    }
    if (seen) {
      if (!arraySome(other, function (othValue, othIndex) {
        if (!cacheHas(seen, othIndex) && (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
          return seen.push(othIndex);
        }
      })) {
        result = false;
        break;
      }
    } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
      result = false;
      break;
    }
  }
  stack['delete'](array);
  stack['delete'](other);
  return result;
}

var Uint8Array$1 = root.Uint8Array;

function mapToArray(map) {
  var index = -1,
    result = Array(map.size);
  map.forEach(function (value, key) {
    result[++index] = [key, value];
  });
  return result;
}

function setToArray(set) {
  var index = -1,
    result = Array(set.size);
  set.forEach(function (value) {
    result[++index] = value;
  });
  return result;
}

var COMPARE_PARTIAL_FLAG$2 = 1,
  COMPARE_UNORDERED_FLAG = 2;
var boolTag$4 = '[object Boolean]',
  dateTag$3 = '[object Date]',
  errorTag$2 = '[object Error]',
  mapTag$5 = '[object Map]',
  numberTag$4 = '[object Number]',
  regexpTag$3 = '[object RegExp]',
  setTag$5 = '[object Set]',
  stringTag$4 = '[object String]',
  symbolTag$2 = '[object Symbol]';
var arrayBufferTag$3 = '[object ArrayBuffer]',
  dataViewTag$4 = '[object DataView]';
var symbolProto$1 = Symbol$1 ? Symbol$1.prototype : undefined,
  symbolValueOf$1 = symbolProto$1 ? symbolProto$1.valueOf : undefined;
function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
  switch (tag) {
    case dataViewTag$4:
      if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
        return false;
      }
      object = object.buffer;
      other = other.buffer;
    case arrayBufferTag$3:
      if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array$1(object), new Uint8Array$1(other))) {
        return false;
      }
      return true;
    case boolTag$4:
    case dateTag$3:
    case numberTag$4:
      return eq(+object, +other);
    case errorTag$2:
      return object.name == other.name && object.message == other.message;
    case regexpTag$3:
    case stringTag$4:
      return object == other + '';
    case mapTag$5:
      var convert = mapToArray;
    case setTag$5:
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG$2;
      convert || (convert = setToArray);
      if (object.size != other.size && !isPartial) {
        return false;
      }
      var stacked = stack.get(object);
      if (stacked) {
        return stacked == other;
      }
      bitmask |= COMPARE_UNORDERED_FLAG;
      stack.set(object, other);
      var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
      stack['delete'](object);
      return result;
    case symbolTag$2:
      if (symbolValueOf$1) {
        return symbolValueOf$1.call(object) == symbolValueOf$1.call(other);
      }
  }
  return false;
}

function arrayPush(array, values) {
  var index = -1,
    length = values.length,
    offset = array.length;
  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}

var isArray = Array.isArray;

function baseGetAllKeys(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
}

function arrayFilter(array, predicate) {
  var index = -1,
    length = array == null ? 0 : array.length,
    resIndex = 0,
    result = [];
  while (++index < length) {
    var value = array[index];
    if (predicate(value, index, array)) {
      result[resIndex++] = value;
    }
  }
  return result;
}

function stubArray() {
  return [];
}

var objectProto$a = Object.prototype;
var propertyIsEnumerable$1 = objectProto$a.propertyIsEnumerable;
var nativeGetSymbols$1 = Object.getOwnPropertySymbols;
var getSymbols = !nativeGetSymbols$1 ? stubArray : function (object) {
  if (object == null) {
    return [];
  }
  object = Object(object);
  return arrayFilter(nativeGetSymbols$1(object), function (symbol) {
    return propertyIsEnumerable$1.call(object, symbol);
  });
};

function baseTimes(n, iteratee) {
  var index = -1,
    result = Array(n);
  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

var argsTag$3 = '[object Arguments]';
function baseIsArguments(value) {
  return isObjectLike(value) && baseGetTag(value) == argsTag$3;
}

var objectProto$9 = Object.prototype;
var hasOwnProperty$8 = objectProto$9.hasOwnProperty;
var propertyIsEnumerable = objectProto$9.propertyIsEnumerable;
var isArguments = baseIsArguments(function () {
  return arguments;
}()) ? baseIsArguments : function (value) {
  return isObjectLike(value) && hasOwnProperty$8.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee');
};

function stubFalse() {
  return false;
}

var freeExports$2 = typeof exports == 'object' && exports && !exports.nodeType && exports;
var freeModule$2 = freeExports$2 && typeof module == 'object' && module && !module.nodeType && module;
var moduleExports$2 = freeModule$2 && freeModule$2.exports === freeExports$2;
var Buffer$1 = moduleExports$2 ? root.Buffer : undefined;
var nativeIsBuffer = Buffer$1 ? Buffer$1.isBuffer : undefined;
var isBuffer = nativeIsBuffer || stubFalse;

var MAX_SAFE_INTEGER$1 = 9007199254740991;
var reIsUint = /^(?:0|[1-9]\d*)$/;
function isIndex(value, length) {
  var type = typeof value;
  length = length == null ? MAX_SAFE_INTEGER$1 : length;
  return !!length && (type == 'number' || type != 'symbol' && reIsUint.test(value)) && value > -1 && value % 1 == 0 && value < length;
}

var MAX_SAFE_INTEGER = 9007199254740991;
function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

var argsTag$2 = '[object Arguments]',
  arrayTag$2 = '[object Array]',
  boolTag$3 = '[object Boolean]',
  dateTag$2 = '[object Date]',
  errorTag$1 = '[object Error]',
  funcTag$1 = '[object Function]',
  mapTag$4 = '[object Map]',
  numberTag$3 = '[object Number]',
  objectTag$4 = '[object Object]',
  regexpTag$2 = '[object RegExp]',
  setTag$4 = '[object Set]',
  stringTag$3 = '[object String]',
  weakMapTag$2 = '[object WeakMap]';
var arrayBufferTag$2 = '[object ArrayBuffer]',
  dataViewTag$3 = '[object DataView]',
  float32Tag$2 = '[object Float32Array]',
  float64Tag$2 = '[object Float64Array]',
  int8Tag$2 = '[object Int8Array]',
  int16Tag$2 = '[object Int16Array]',
  int32Tag$2 = '[object Int32Array]',
  uint8Tag$2 = '[object Uint8Array]',
  uint8ClampedTag$2 = '[object Uint8ClampedArray]',
  uint16Tag$2 = '[object Uint16Array]',
  uint32Tag$2 = '[object Uint32Array]';
var typedArrayTags = {};
typedArrayTags[float32Tag$2] = typedArrayTags[float64Tag$2] = typedArrayTags[int8Tag$2] = typedArrayTags[int16Tag$2] = typedArrayTags[int32Tag$2] = typedArrayTags[uint8Tag$2] = typedArrayTags[uint8ClampedTag$2] = typedArrayTags[uint16Tag$2] = typedArrayTags[uint32Tag$2] = true;
typedArrayTags[argsTag$2] = typedArrayTags[arrayTag$2] = typedArrayTags[arrayBufferTag$2] = typedArrayTags[boolTag$3] = typedArrayTags[dataViewTag$3] = typedArrayTags[dateTag$2] = typedArrayTags[errorTag$1] = typedArrayTags[funcTag$1] = typedArrayTags[mapTag$4] = typedArrayTags[numberTag$3] = typedArrayTags[objectTag$4] = typedArrayTags[regexpTag$2] = typedArrayTags[setTag$4] = typedArrayTags[stringTag$3] = typedArrayTags[weakMapTag$2] = false;
function baseIsTypedArray(value) {
  return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
}

function baseUnary(func) {
  return function (value) {
    return func(value);
  };
}

var freeExports$1 = typeof exports == 'object' && exports && !exports.nodeType && exports;
var freeModule$1 = freeExports$1 && typeof module == 'object' && module && !module.nodeType && module;
var moduleExports$1 = freeModule$1 && freeModule$1.exports === freeExports$1;
var freeProcess = moduleExports$1 && freeGlobal.process;
var nodeUtil = function () {
  try {
    var types = freeModule$1 && freeModule$1.require && freeModule$1.require('util').types;
    if (types) {
      return types;
    }
    return freeProcess && freeProcess.binding && freeProcess.binding('util');
  } catch (e) {}
}();

var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

var objectProto$8 = Object.prototype;
var hasOwnProperty$7 = objectProto$8.hasOwnProperty;
function arrayLikeKeys(value, inherited) {
  var isArr = isArray(value),
    isArg = !isArr && isArguments(value),
    isBuff = !isArr && !isArg && isBuffer(value),
    isType = !isArr && !isArg && !isBuff && isTypedArray(value),
    skipIndexes = isArr || isArg || isBuff || isType,
    result = skipIndexes ? baseTimes(value.length, String) : [],
    length = result.length;
  for (var key in value) {
    if ((inherited || hasOwnProperty$7.call(value, key)) && !(skipIndexes && (
    key == 'length' ||
    isBuff && (key == 'offset' || key == 'parent') ||
    isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset') ||
    isIndex(key, length)))) {
      result.push(key);
    }
  }
  return result;
}

var objectProto$7 = Object.prototype;
function isPrototype(value) {
  var Ctor = value && value.constructor,
    proto = typeof Ctor == 'function' && Ctor.prototype || objectProto$7;
  return value === proto;
}

function overArg(func, transform) {
  return function (arg) {
    return func(transform(arg));
  };
}

var nativeKeys = overArg(Object.keys, Object);

var objectProto$6 = Object.prototype;
var hasOwnProperty$6 = objectProto$6.hasOwnProperty;
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty$6.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

function getAllKeys(object) {
  return baseGetAllKeys(object, keys, getSymbols);
}

var COMPARE_PARTIAL_FLAG$1 = 1;
var objectProto$5 = Object.prototype;
var hasOwnProperty$5 = objectProto$5.hasOwnProperty;
function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG$1,
    objProps = getAllKeys(object),
    objLength = objProps.length,
    othProps = getAllKeys(other),
    othLength = othProps.length;
  if (objLength != othLength && !isPartial) {
    return false;
  }
  var index = objLength;
  while (index--) {
    var key = objProps[index];
    if (!(isPartial ? key in other : hasOwnProperty$5.call(other, key))) {
      return false;
    }
  }
  var objStacked = stack.get(object);
  var othStacked = stack.get(other);
  if (objStacked && othStacked) {
    return objStacked == other && othStacked == object;
  }
  var result = true;
  stack.set(object, other);
  stack.set(other, object);
  var skipCtor = isPartial;
  while (++index < objLength) {
    key = objProps[index];
    var objValue = object[key],
      othValue = other[key];
    if (customizer) {
      var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
    }
    if (!(compared === undefined ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
      result = false;
      break;
    }
    skipCtor || (skipCtor = key == 'constructor');
  }
  if (result && !skipCtor) {
    var objCtor = object.constructor,
      othCtor = other.constructor;
    if (objCtor != othCtor && 'constructor' in object && 'constructor' in other && !(typeof objCtor == 'function' && objCtor instanceof objCtor && typeof othCtor == 'function' && othCtor instanceof othCtor)) {
      result = false;
    }
  }
  stack['delete'](object);
  stack['delete'](other);
  return result;
}

var DataView = getNative(root, 'DataView');

var Promise$1 = getNative(root, 'Promise');

var Set$1 = getNative(root, 'Set');

var WeakMap$1 = getNative(root, 'WeakMap');

var mapTag$3 = '[object Map]',
  objectTag$3 = '[object Object]',
  promiseTag = '[object Promise]',
  setTag$3 = '[object Set]',
  weakMapTag$1 = '[object WeakMap]';
var dataViewTag$2 = '[object DataView]';
var dataViewCtorString = toSource(DataView),
  mapCtorString = toSource(Map$1),
  promiseCtorString = toSource(Promise$1),
  setCtorString = toSource(Set$1),
  weakMapCtorString = toSource(WeakMap$1);
var getTag = baseGetTag;
if (DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag$2 || Map$1 && getTag(new Map$1()) != mapTag$3 || Promise$1 && getTag(Promise$1.resolve()) != promiseTag || Set$1 && getTag(new Set$1()) != setTag$3 || WeakMap$1 && getTag(new WeakMap$1()) != weakMapTag$1) {
  getTag = function (value) {
    var result = baseGetTag(value),
      Ctor = result == objectTag$3 ? value.constructor : undefined,
      ctorString = Ctor ? toSource(Ctor) : '';
    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString:
          return dataViewTag$2;
        case mapCtorString:
          return mapTag$3;
        case promiseCtorString:
          return promiseTag;
        case setCtorString:
          return setTag$3;
        case weakMapCtorString:
          return weakMapTag$1;
      }
    }
    return result;
  };
}
var getTag$1 = getTag;

var COMPARE_PARTIAL_FLAG = 1;
var argsTag$1 = '[object Arguments]',
  arrayTag$1 = '[object Array]',
  objectTag$2 = '[object Object]';
var objectProto$4 = Object.prototype;
var hasOwnProperty$4 = objectProto$4.hasOwnProperty;
function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
  var objIsArr = isArray(object),
    othIsArr = isArray(other),
    objTag = objIsArr ? arrayTag$1 : getTag$1(object),
    othTag = othIsArr ? arrayTag$1 : getTag$1(other);
  objTag = objTag == argsTag$1 ? objectTag$2 : objTag;
  othTag = othTag == argsTag$1 ? objectTag$2 : othTag;
  var objIsObj = objTag == objectTag$2,
    othIsObj = othTag == objectTag$2,
    isSameTag = objTag == othTag;
  if (isSameTag && isBuffer(object)) {
    if (!isBuffer(other)) {
      return false;
    }
    objIsArr = true;
    objIsObj = false;
  }
  if (isSameTag && !objIsObj) {
    stack || (stack = new Stack());
    return objIsArr || isTypedArray(object) ? equalArrays(object, other, bitmask, customizer, equalFunc, stack) : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
  }
  if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
    var objIsWrapped = objIsObj && hasOwnProperty$4.call(object, '__wrapped__'),
      othIsWrapped = othIsObj && hasOwnProperty$4.call(other, '__wrapped__');
    if (objIsWrapped || othIsWrapped) {
      var objUnwrapped = objIsWrapped ? object.value() : object,
        othUnwrapped = othIsWrapped ? other.value() : other;
      stack || (stack = new Stack());
      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
    }
  }
  if (!isSameTag) {
    return false;
  }
  stack || (stack = new Stack());
  return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
}

function baseIsEqual(value, other, bitmask, customizer, stack) {
  if (value === other) {
    return true;
  }
  if (value == null || other == null || !isObjectLike(value) && !isObjectLike(other)) {
    return value !== value && other !== other;
  }
  return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
}

function isEqual(value, other) {
  return baseIsEqual(value, other);
}

function Injectable() {
  return target => {
    const dependencies = Reflect.getMetadata(META_PARAMTYPES, target) ?? [];
    Reflect.defineMetadata(META_PARAMTYPES, dependencies, target);
  };
}

class TypeCheck {
  get CorrespondingMap() {
    return {
      char: "isChar",
      string: "isString",
      number: "isNumber",
      int: "isInteger",
      nan: "isNaN",
      boolean: "isBoolean",
      object: "isObject",
      null: "isNull",
      function: "isFunction",
      array: "isArray",
      "object-literal": "isObjectLiteral",
      undefined: "isUndefined",
      bigint: "isBigInt",
      symbol: "isSymbol"
    };
  }
  get TypeSet() {
    return ["char", "string", "number", "int", "nan", "boolean", "object", "null", "function", "array", "object-literal", "undefined", "bigint", "symbol"];
  }
  isChar(value) {
    return typeof value === "string" && value.length === 1;
  }
  isString(value) {
    return typeof value === "string";
  }
  isNumber(value) {
    return typeof value === "number" && !isNaN(value) && isFinite(value);
  }
  isInteger(value) {
    return typeof value === "number" && !isNaN(value) && Number.isInteger(value);
  }
  isNaN(value) {
    return isNaN(value);
  }
  isBoolean(value) {
    return typeof value === "boolean";
  }
  isObject(value) {
    return typeof value === "object" || Array.isArray(value) || typeof value === "function";
  }
  isNull(value) {
    return value === null;
  }
  isFunction(value) {
    return typeof value === "function";
  }
  isArray(value) {
    return Array.isArray(value);
  }
  isObjectLiteral(value) {
    return typeof value === "object" && !Array.isArray(value) && value !== null;
  }
  isUndefined(value) {
    return value === undefined;
  }
  isUndefinedOrNull(value) {
    return value === undefined || value === null;
  }
  isBigInt(value) {
    return typeof value === "bigint";
  }
  isSymbol(value) {
    return typeof value === "symbol";
  }
}

let ScheduledTask = class ScheduledTask {
  typeCheck;
  #tasks = new Map();
  #timer;
  #interval = 1000 * 60 * 10;
  get interval() {
    return this.#interval;
  }
  constructor(typeCheck) {
    this.typeCheck = typeCheck;
  }
  execute() {
    this.runTasks();
  }
  setInterval(interval) {
    if (this.typeCheck.isUndefinedOrNull(interval) || interval <= 0) {
      return;
    }
    this.#interval = interval;
  }
  addTask(task) {
    this.#tasks.set(Math.random().toString(), task);
    this.startSchedule();
  }
  addSingletonTask(key, task) {
    if (this.#tasks.has(key)) {
      return;
    }
    this.#tasks.set(key, task);
    this.startSchedule();
  }
  clearSchedule() {
    clearInterval(this.#timer);
    this.#timer = undefined;
    this.#tasks.clear();
  }
  startSchedule() {
    if (!this.typeCheck.isUndefinedOrNull(this.#timer)) {
      return;
    }
    this.#timer = setInterval(() => {
      const size = this.runTasks();
      if (!size) {
        this.clearSchedule();
      }
    }, this.interval);
  }
  runTasks() {
    const now = Date.now();
    this.#tasks.forEach((task, token) => {
      const popSignal = task(now);
      if (popSignal) {
        this.#tasks.delete(token);
      }
    });
    return this.#tasks.size;
  }
};
ScheduledTask = __decorate([Injectable(), __metadata("design:paramtypes", [TypeCheck])], ScheduledTask);
var ScheduledTask$1 = ScheduledTask;

class LocalStorageCache {
  name = "localStorage";
  keyStore = new Set();
  set(requestKey, cacheData) {
    this.keyStore.add(requestKey);
    localStorage.setItem(requestKey, JSON.stringify(cacheData));
  }
  delete(requestKey) {
    this.keyStore.delete(requestKey);
    localStorage.removeItem(requestKey);
  }
  has(requestKey) {
    return this.keyStore.has(requestKey);
  }
  get(requestKey) {
    let data = localStorage.getItem(requestKey);
    if (!data) return;
    data = JSON.parse(data);
    const existed = this.checkExpiration(requestKey, data);
    if (existed) return data;
  }
  clear() {
    this.keyStore.forEach(key => {
      localStorage.removeItem(key);
    });
    this.keyStore.clear();
  }
  scheduledTask(now) {
    this.keyStore.forEach(key => {
      const data = this.get(key);
      if (!data) {
        this.keyStore.delete(key);
        return;
      }
      if (now > data.expiration) {
        this.delete(key);
        this.keyStore.delete(key);
      }
    });
    return !this.keyStore.size;
  }
  checkExpiration(requestKey, cacheData) {
    if (!cacheData) return false;
    if (Date.now() > cacheData.expiration) {
      this.delete(requestKey);
      return false;
    }
    return true;
  }
}

class SessionStorageCache {
  name = "sessionStorage";
  keyStore = new Set();
  set(requestKey, cacheData) {
    this.keyStore.add(requestKey);
    sessionStorage.setItem(requestKey, JSON.stringify(cacheData));
  }
  delete(requestKey) {
    this.keyStore.delete(requestKey);
    sessionStorage.removeItem(requestKey);
  }
  has(requestKey) {
    return this.keyStore.has(requestKey);
  }
  get(requestKey) {
    let data = sessionStorage.getItem(requestKey);
    if (!data) return;
    data = JSON.parse(data);
    const existed = this.checkExpiration(requestKey, data);
    if (existed) return data;
  }
  clear() {
    this.keyStore.forEach(key => {
      sessionStorage.removeItem(key);
    });
    this.keyStore.clear();
  }
  scheduledTask(now) {
    this.keyStore.forEach(key => {
      const data = this.get(key);
      if (!data) {
        this.keyStore.delete(key);
        return;
      }
      if (now > data.expiration) {
        this.delete(key);
        this.keyStore.delete(key);
      }
    });
    return !this.keyStore.size;
  }
  checkExpiration(requestKey, cacheData) {
    if (!cacheData) return false;
    if (Date.now() > cacheData.expiration) {
      this.delete(requestKey);
      return false;
    }
    return true;
  }
}

let CachePipe = class CachePipe {
  scheduledTask;
  memoryCache;
  localStorageCache;
  sessionStorageCache;
  constructor(scheduledTask, memoryCache, localStorageCache, sessionStorageCache) {
    this.scheduledTask = scheduledTask;
    this.memoryCache = memoryCache;
    this.localStorageCache = localStorageCache;
    this.sessionStorageCache = sessionStorageCache;
  }
  chain(requestDetail, options) {
    const {
      cacheStrategyType,
      expiration
    } = options;
    const cache = this.getCacheStrategy(cacheStrategyType ?? "memory");
    const {
      promiseExecutor,
      requestExecutor,
      requestKey,
      payload
    } = requestDetail;
    const cacheData = cache.get(requestKey);
    const currentT = Date.now();
    if (cacheData && cacheData.expiration > currentT) {
      const {
        res
      } = cacheData;
      const isSameRequest = isEqual(payload, cacheData.payload);
      if (isSameRequest) {
        const [reqPromise, abortControler] = requestExecutor(false);
        const reqExecutor = () => [reqPromise, abortControler];
        promiseExecutor.resolve(res);
        return reqExecutor;
      }
    }
    const [reqPromise, abortControler] = requestExecutor(true);
    const newPromise = reqPromise.then(this.promiseCallbackFactory(requestKey, cache, {
      payload,
      expiration: (expiration ?? 1000 * 60 * 10) + currentT
    }));
    return () => [newPromise, abortControler];
  }
  getCacheStrategy(type) {
    if (type === "memory") return this.memoryCache;else if (type === "localStorage") return this.localStorageCache;else if (type === "sessionStorage") return this.sessionStorageCache;else throw new Error(`failed to use "${type}" cache strategy.`);
  }
  promiseCallbackFactory(requestKey, cache, cacheData) {
    return res => {
      const data = {
        ...cacheData,
        res
      };
      this.scheduledTask.addSingletonTask(cache.name, now => cache.scheduledTask(now));
      cache.set(requestKey, data);
      return res;
    };
  }
};
CachePipe = __decorate([Injectable(), __metadata("design:paramtypes", [ScheduledTask$1, MemoryCache, LocalStorageCache, SessionStorageCache])], CachePipe);
var CachePipe$1 = CachePipe;

function arrayEach(array, iteratee) {
  var index = -1,
    length = array == null ? 0 : array.length;
  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}

var defineProperty = function () {
  try {
    var func = getNative(Object, 'defineProperty');
    func({}, '', {});
    return func;
  } catch (e) {}
}();

function baseAssignValue(object, key, value) {
  if (key == '__proto__' && defineProperty) {
    defineProperty(object, key, {
      'configurable': true,
      'enumerable': true,
      'value': value,
      'writable': true
    });
  } else {
    object[key] = value;
  }
}

var objectProto$3 = Object.prototype;
var hasOwnProperty$3 = objectProto$3.hasOwnProperty;
function assignValue(object, key, value) {
  var objValue = object[key];
  if (!(hasOwnProperty$3.call(object, key) && eq(objValue, value)) || value === undefined && !(key in object)) {
    baseAssignValue(object, key, value);
  }
}

function copyObject(source, props, object, customizer) {
  var isNew = !object;
  object || (object = {});
  var index = -1,
    length = props.length;
  while (++index < length) {
    var key = props[index];
    var newValue = customizer ? customizer(object[key], source[key], key, object, source) : undefined;
    if (newValue === undefined) {
      newValue = source[key];
    }
    if (isNew) {
      baseAssignValue(object, key, newValue);
    } else {
      assignValue(object, key, newValue);
    }
  }
  return object;
}

function baseAssign(object, source) {
  return object && copyObject(source, keys(source), object);
}

function nativeKeysIn(object) {
  var result = [];
  if (object != null) {
    for (var key in Object(object)) {
      result.push(key);
    }
  }
  return result;
}

var objectProto$2 = Object.prototype;
var hasOwnProperty$2 = objectProto$2.hasOwnProperty;
function baseKeysIn(object) {
  if (!isObject(object)) {
    return nativeKeysIn(object);
  }
  var isProto = isPrototype(object),
    result = [];
  for (var key in object) {
    if (!(key == 'constructor' && (isProto || !hasOwnProperty$2.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}

function keysIn(object) {
  return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
}

function baseAssignIn(object, source) {
  return object && copyObject(source, keysIn(source), object);
}

var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;
var moduleExports = freeModule && freeModule.exports === freeExports;
var Buffer = moduleExports ? root.Buffer : undefined,
  allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined;
function cloneBuffer(buffer, isDeep) {
  if (isDeep) {
    return buffer.slice();
  }
  var length = buffer.length,
    result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);
  buffer.copy(result);
  return result;
}

function copyArray(source, array) {
  var index = -1,
    length = source.length;
  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}

function copySymbols(source, object) {
  return copyObject(source, getSymbols(source), object);
}

var getPrototype = overArg(Object.getPrototypeOf, Object);
var getPrototype$1 = getPrototype;

var nativeGetSymbols = Object.getOwnPropertySymbols;
var getSymbolsIn = !nativeGetSymbols ? stubArray : function (object) {
  var result = [];
  while (object) {
    arrayPush(result, getSymbols(object));
    object = getPrototype$1(object);
  }
  return result;
};

function copySymbolsIn(source, object) {
  return copyObject(source, getSymbolsIn(source), object);
}

function getAllKeysIn(object) {
  return baseGetAllKeys(object, keysIn, getSymbolsIn);
}

var objectProto$1 = Object.prototype;
var hasOwnProperty$1 = objectProto$1.hasOwnProperty;
function initCloneArray(array) {
  var length = array.length,
    result = new array.constructor(length);
  if (length && typeof array[0] == 'string' && hasOwnProperty$1.call(array, 'index')) {
    result.index = array.index;
    result.input = array.input;
  }
  return result;
}

function cloneArrayBuffer(arrayBuffer) {
  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
  new Uint8Array$1(result).set(new Uint8Array$1(arrayBuffer));
  return result;
}

function cloneDataView(dataView, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
  return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
}

var reFlags = /\w*$/;
function cloneRegExp(regexp) {
  var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
  result.lastIndex = regexp.lastIndex;
  return result;
}

var symbolProto = Symbol$1 ? Symbol$1.prototype : undefined,
  symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;
function cloneSymbol(symbol) {
  return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
}

function cloneTypedArray(typedArray, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
}

var boolTag$2 = '[object Boolean]',
  dateTag$1 = '[object Date]',
  mapTag$2 = '[object Map]',
  numberTag$2 = '[object Number]',
  regexpTag$1 = '[object RegExp]',
  setTag$2 = '[object Set]',
  stringTag$2 = '[object String]',
  symbolTag$1 = '[object Symbol]';
var arrayBufferTag$1 = '[object ArrayBuffer]',
  dataViewTag$1 = '[object DataView]',
  float32Tag$1 = '[object Float32Array]',
  float64Tag$1 = '[object Float64Array]',
  int8Tag$1 = '[object Int8Array]',
  int16Tag$1 = '[object Int16Array]',
  int32Tag$1 = '[object Int32Array]',
  uint8Tag$1 = '[object Uint8Array]',
  uint8ClampedTag$1 = '[object Uint8ClampedArray]',
  uint16Tag$1 = '[object Uint16Array]',
  uint32Tag$1 = '[object Uint32Array]';
function initCloneByTag(object, tag, isDeep) {
  var Ctor = object.constructor;
  switch (tag) {
    case arrayBufferTag$1:
      return cloneArrayBuffer(object);
    case boolTag$2:
    case dateTag$1:
      return new Ctor(+object);
    case dataViewTag$1:
      return cloneDataView(object, isDeep);
    case float32Tag$1:
    case float64Tag$1:
    case int8Tag$1:
    case int16Tag$1:
    case int32Tag$1:
    case uint8Tag$1:
    case uint8ClampedTag$1:
    case uint16Tag$1:
    case uint32Tag$1:
      return cloneTypedArray(object, isDeep);
    case mapTag$2:
      return new Ctor();
    case numberTag$2:
    case stringTag$2:
      return new Ctor(object);
    case regexpTag$1:
      return cloneRegExp(object);
    case setTag$2:
      return new Ctor();
    case symbolTag$1:
      return cloneSymbol(object);
  }
}

var objectCreate = Object.create;
var baseCreate = function () {
  function object() {}
  return function (proto) {
    if (!isObject(proto)) {
      return {};
    }
    if (objectCreate) {
      return objectCreate(proto);
    }
    object.prototype = proto;
    var result = new object();
    object.prototype = undefined;
    return result;
  };
}();

function initCloneObject(object) {
  return typeof object.constructor == 'function' && !isPrototype(object) ? baseCreate(getPrototype$1(object)) : {};
}

var mapTag$1 = '[object Map]';
function baseIsMap(value) {
  return isObjectLike(value) && getTag$1(value) == mapTag$1;
}

var nodeIsMap = nodeUtil && nodeUtil.isMap;
var isMap = nodeIsMap ? baseUnary(nodeIsMap) : baseIsMap;

var setTag$1 = '[object Set]';
function baseIsSet(value) {
  return isObjectLike(value) && getTag$1(value) == setTag$1;
}

var nodeIsSet = nodeUtil && nodeUtil.isSet;
var isSet = nodeIsSet ? baseUnary(nodeIsSet) : baseIsSet;

var CLONE_DEEP_FLAG$1 = 1,
  CLONE_FLAT_FLAG = 2,
  CLONE_SYMBOLS_FLAG$1 = 4;
var argsTag = '[object Arguments]',
  arrayTag = '[object Array]',
  boolTag$1 = '[object Boolean]',
  dateTag = '[object Date]',
  errorTag = '[object Error]',
  funcTag = '[object Function]',
  genTag = '[object GeneratorFunction]',
  mapTag = '[object Map]',
  numberTag$1 = '[object Number]',
  objectTag$1 = '[object Object]',
  regexpTag = '[object RegExp]',
  setTag = '[object Set]',
  stringTag$1 = '[object String]',
  symbolTag = '[object Symbol]',
  weakMapTag = '[object WeakMap]';
var arrayBufferTag = '[object ArrayBuffer]',
  dataViewTag = '[object DataView]',
  float32Tag = '[object Float32Array]',
  float64Tag = '[object Float64Array]',
  int8Tag = '[object Int8Array]',
  int16Tag = '[object Int16Array]',
  int32Tag = '[object Int32Array]',
  uint8Tag = '[object Uint8Array]',
  uint8ClampedTag = '[object Uint8ClampedArray]',
  uint16Tag = '[object Uint16Array]',
  uint32Tag = '[object Uint32Array]';
var cloneableTags = {};
cloneableTags[argsTag] = cloneableTags[arrayTag] = cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] = cloneableTags[boolTag$1] = cloneableTags[dateTag] = cloneableTags[float32Tag] = cloneableTags[float64Tag] = cloneableTags[int8Tag] = cloneableTags[int16Tag] = cloneableTags[int32Tag] = cloneableTags[mapTag] = cloneableTags[numberTag$1] = cloneableTags[objectTag$1] = cloneableTags[regexpTag] = cloneableTags[setTag] = cloneableTags[stringTag$1] = cloneableTags[symbolTag] = cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] = cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
cloneableTags[errorTag] = cloneableTags[funcTag] = cloneableTags[weakMapTag] = false;
function baseClone(value, bitmask, customizer, key, object, stack) {
  var result,
    isDeep = bitmask & CLONE_DEEP_FLAG$1,
    isFlat = bitmask & CLONE_FLAT_FLAG,
    isFull = bitmask & CLONE_SYMBOLS_FLAG$1;
  if (customizer) {
    result = object ? customizer(value, key, object, stack) : customizer(value);
  }
  if (result !== undefined) {
    return result;
  }
  if (!isObject(value)) {
    return value;
  }
  var isArr = isArray(value);
  if (isArr) {
    result = initCloneArray(value);
    if (!isDeep) {
      return copyArray(value, result);
    }
  } else {
    var tag = getTag$1(value),
      isFunc = tag == funcTag || tag == genTag;
    if (isBuffer(value)) {
      return cloneBuffer(value, isDeep);
    }
    if (tag == objectTag$1 || tag == argsTag || isFunc && !object) {
      result = isFlat || isFunc ? {} : initCloneObject(value);
      if (!isDeep) {
        return isFlat ? copySymbolsIn(value, baseAssignIn(result, value)) : copySymbols(value, baseAssign(result, value));
      }
    } else {
      if (!cloneableTags[tag]) {
        return object ? value : {};
      }
      result = initCloneByTag(value, tag, isDeep);
    }
  }
  stack || (stack = new Stack());
  var stacked = stack.get(value);
  if (stacked) {
    return stacked;
  }
  stack.set(value, result);
  if (isSet(value)) {
    value.forEach(function (subValue) {
      result.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
    });
  } else if (isMap(value)) {
    value.forEach(function (subValue, key) {
      result.set(key, baseClone(subValue, bitmask, customizer, key, value, stack));
    });
  }
  var keysFunc = isFull ? isFlat ? getAllKeysIn : getAllKeys : isFlat ? keysIn : keys;
  var props = isArr ? undefined : keysFunc(value);
  arrayEach(props || value, function (subValue, key) {
    if (props) {
      key = subValue;
      subValue = value[key];
    }
    assignValue(result, key, baseClone(subValue, bitmask, customizer, key, value, stack));
  });
  return result;
}

var CLONE_DEEP_FLAG = 1,
  CLONE_SYMBOLS_FLAG = 4;
function cloneDeep(value) {
  return baseClone(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG);
}

class Template {
  withPrefix(options) {
    const {
      type = "warn",
      messages
    } = options;
    let t = `[karman ${type}] `;
    for (const item of messages) {
      t += item;
    }
    return t;
  }
  warn(...messages) {
    console.warn(this.withPrefix({
      messages
    }));
  }
  throw(...messages) {
    throw new Error(this.withPrefix({
      messages
    }));
  }
}

let Xhr = class Xhr {
  typeCheck;
  template;
  constructor(typeCheck, template) {
    this.typeCheck = typeCheck;
    this.template = template;
  }
  request(payload, config) {
    const {
      url,
      method = "GET"
    } = config;
    const [xhr, cleanup, requestKey] = this.initXhr({
      method,
      url
    });
    this.setBasicSettings(xhr, config);
    const [reqExecutor, promiseExecutor] = this.buildPromise(xhr, cleanup, config);
    const requestExecutor = send => {
      if (xhr && send) xhr.send(payload ?? null);
      return reqExecutor();
    };
    return {
      requestKey,
      requestExecutor,
      promiseExecutor,
      config
    };
  }
  initXhr(options) {
    const method = options.method?.toUpperCase() ?? "GET";
    const {
      url
    } = options;
    const requestKey = `xhr:${method}:${url}`;
    let xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    const cleanup = () => {
      xhr = null;
    };
    return [xhr, cleanup, requestKey];
  }
  setBasicSettings(xhr, config) {
    const {
      timeout,
      auth,
      headers,
      responseType = "",
      withCredentials
    } = config;
    xhr.timeout = timeout ?? 0;
    xhr.withCredentials = !!withCredentials;
    xhr.responseType = responseType;
    const _headers = cloneDeep(headers) ?? {};
    Object.assign(_headers, this.getAuthHeaders(auth));
    this.setRequestHeader(xhr, _headers);
  }
  getAuthHeaders(auth) {
    let {
      password
    } = auth ?? {};
    const {
      username
    } = auth ?? {};
    if (this.typeCheck.isUndefinedOrNull(username) || this.typeCheck.isUndefinedOrNull(password)) return;
    password = decodeURIComponent(encodeURIComponent(password));
    const Authorization = "Basic " + btoa(username + ":" + password);
    return {
      Authorization
    };
  }
  setRequestHeader(xhr, headers) {
    const _headers = headers ?? {};
    for (const key in _headers) {
      if (!Object.prototype.hasOwnProperty.call(_headers, key)) continue;
      const value = _headers[key];
      xhr.setRequestHeader(key, value);
    }
  }
  buildPromise(xhr, cleanup, config) {
    const promiseExecutor = {
      resolve: cleanup,
      reject: cleanup
    };
    const requestExecuter = () => {
      let abortController = () => {
        this.template.warn("Failed to abort request.");
      };
      const requestPromise = new Promise((_resolve, _reject) => {
        const resolve = value => {
          cleanup();
          _resolve(value);
        };
        const reject = reason => {
          cleanup();
          _reject(reason);
        };
        abortController = reason => {
          xhr && xhr.abort();
          reject(reason);
        };
        promiseExecutor.resolve = resolve;
        promiseExecutor.reject = reject;
        xhr.onloadend = this.hooksHandlerFactory(xhr, config, promiseExecutor, this.handleLoadend);
        xhr.onabort = this.hooksHandlerFactory(xhr, config, promiseExecutor, this.handleAbort);
        xhr.ontimeout = this.hooksHandlerFactory(xhr, config, promiseExecutor, this.handleTimeout);
        xhr.onerror = this.hooksHandlerFactory(xhr, config, promiseExecutor, this.handleError);
      });
      return [requestPromise, abortController];
    };
    return [requestExecuter, promiseExecutor];
  }
  hooksHandlerFactory(xhr, config, executer, handler) {
    return e => handler.call(this, e, config, xhr, executer);
  }
  handleAbort(_, __, xhr, {
    reject
  }) {
    xhr && reject(new Error("Request aborted"));
  }
  handleTimeout(_, config, xhr, {
    reject
  }) {
    if (!xhr) return;
    const {
      timeout,
      timeoutErrorMessage
    } = config ?? {};
    let errorMessage = timeout ? `time of ${timeout}ms exceeded` : "timeout exceeded";
    if (timeoutErrorMessage) errorMessage = timeoutErrorMessage;
    reject(new Error(errorMessage));
  }
  handleError(_, config, xhr, {
    reject
  }) {
    if (!xhr) return;
    const {
      url
    } = config ?? {};
    const {
      status
    } = xhr;
    reject(new Error(`Network Error ${url} ${status}`));
  }
  handleLoadend(_, config, xhr, {
    resolve
  }) {
    if (!xhr) return;
    const {
      responseType,
      response,
      responseText,
      status,
      statusText
    } = xhr;
    let data = !responseType || responseType === "text" || responseType === "json" ? responseText : response;
    const headers = xhr.getAllResponseHeaders();
    const headersMap = this.getHeaderMap(headers);
    if (headersMap?.["content-type"]?.includes("json") || responseType === "json") data = JSON.parse(data);
    const res = {
      data,
      status,
      statusText,
      headers: config?.headerMap ? headersMap : headers,
      config,
      request: xhr
    };
    resolve(res);
  }
  getHeaderMap(headers) {
    if (!headers) return {};
    const arr = headers.trim().split(/[\r\n]+/);
    const headerMap = {};
    arr.forEach(line => {
      const parts = line.split(": ");
      const header = parts.shift();
      const value = parts.join(": ");
      if (header) Object.defineProperty(headerMap, header, {
        value
      });
    });
    return headerMap;
  }
};
Xhr = __decorate([Injectable(), __metadata("design:paramtypes", [TypeCheck, Template])], Xhr);
var Xhr$1 = Xhr;

class PathResolver {
  get #dot() {
    return ".";
  }
  get #dbDot() {
    return "..";
  }
  get #slash() {
    return "/";
  }
  get #dbSlash() {
    return "//";
  }
  get #http() {
    return "http:";
  }
  get #https() {
    return "https:";
  }
  #dotStart(path, position) {
    return path.startsWith(this.#dot, position);
  }
  #dotEnd(path, endPosition) {
    return path.endsWith(this.#dot, endPosition);
  }
  #slashStart(path, position) {
    return path.startsWith(this.#slash, position);
  }
  #slashEnd(path, endPosition) {
    return path.endsWith(this.#slash, endPosition);
  }
  trimStart(path) {
    while (this.#slashStart(path) || this.#dotStart(path)) {
      path = path.slice(1);
    }
    return path;
  }
  trimEnd(path) {
    while (this.#slashEnd(path) || this.#dotEnd(path)) {
      path = path.slice(0, -1);
    }
    return path;
  }
  trim(path) {
    path = this.trimStart(path);
    return this.trimEnd(path);
  }
  antiSlash(path) {
    return path.split(/\/+/).filter(segment => !!segment);
  }
  split(...paths) {
    const splitPaths = paths.map(this.antiSlash).flat();
    if (splitPaths[0] === this.#http || splitPaths[0] === this.#https) {
      splitPaths[0] = splitPaths[0] + this.#dbSlash + splitPaths[1];
      splitPaths.splice(1, 1);
    }
    return splitPaths;
  }
  join(...paths) {
    return this.split(...paths).join(this.#slash);
  }
  resolve(...paths) {
    return this.split(...paths).reduce((pre, cur, i) => {
      if (cur === this.#dot) {
        return pre;
      }
      if (cur === this.#dbDot) {
        const lastSlash = pre.lastIndexOf(this.#slash);
        const noSlash = lastSlash === -1;
        const httpLeft = [5, 6, 7].includes(lastSlash) && (pre.startsWith(this.#http) || pre.startsWith(this.#https));
        if (noSlash || httpLeft) {
          return pre;
        }
        return pre.slice(0, lastSlash);
      }
      if (!i) {
        return cur;
      }
      return pre += this.#slash + cur;
    }, "");
  }
  resolveURL(options) {
    const {
      query,
      paths
    } = options;
    let url = this.resolve(...paths);
    if (!query) {
      return url;
    }
    const queryParams = Object.entries(query);
    queryParams.length && queryParams.forEach(([key, value], i) => {
      if (!i) {
        url += "?";
      } else {
        url += "&";
      }
      url += key + "=" + value;
    });
    return url;
  }
}

function assignMergeValue(object, key, value) {
  if (value !== undefined && !eq(object[key], value) || value === undefined && !(key in object)) {
    baseAssignValue(object, key, value);
  }
}

function createBaseFor(fromRight) {
  return function (object, iteratee, keysFunc) {
    var index = -1,
      iterable = Object(object),
      props = keysFunc(object),
      length = props.length;
    while (length--) {
      var key = props[fromRight ? length : ++index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  };
}

var baseFor = createBaseFor();

function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}

var objectTag = '[object Object]';
var funcProto = Function.prototype,
  objectProto = Object.prototype;
var funcToString = funcProto.toString;
var hasOwnProperty = objectProto.hasOwnProperty;
var objectCtorString = funcToString.call(Object);
function isPlainObject(value) {
  if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
    return false;
  }
  var proto = getPrototype$1(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
  return typeof Ctor == 'function' && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
}

function safeGet(object, key) {
  if (key === 'constructor' && typeof object[key] === 'function') {
    return;
  }
  if (key == '__proto__') {
    return;
  }
  return object[key];
}

function toPlainObject(value) {
  return copyObject(value, keysIn(value));
}

function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
  var objValue = safeGet(object, key),
    srcValue = safeGet(source, key),
    stacked = stack.get(srcValue);
  if (stacked) {
    assignMergeValue(object, key, stacked);
    return;
  }
  var newValue = customizer ? customizer(objValue, srcValue, key + '', object, source, stack) : undefined;
  var isCommon = newValue === undefined;
  if (isCommon) {
    var isArr = isArray(srcValue),
      isBuff = !isArr && isBuffer(srcValue),
      isTyped = !isArr && !isBuff && isTypedArray(srcValue);
    newValue = srcValue;
    if (isArr || isBuff || isTyped) {
      if (isArray(objValue)) {
        newValue = objValue;
      } else if (isArrayLikeObject(objValue)) {
        newValue = copyArray(objValue);
      } else if (isBuff) {
        isCommon = false;
        newValue = cloneBuffer(srcValue, true);
      } else if (isTyped) {
        isCommon = false;
        newValue = cloneTypedArray(srcValue, true);
      } else {
        newValue = [];
      }
    } else if (isPlainObject(srcValue) || isArguments(srcValue)) {
      newValue = objValue;
      if (isArguments(objValue)) {
        newValue = toPlainObject(objValue);
      } else if (!isObject(objValue) || isFunction(objValue)) {
        newValue = initCloneObject(srcValue);
      }
    } else {
      isCommon = false;
    }
  }
  if (isCommon) {
    stack.set(srcValue, newValue);
    mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
    stack['delete'](srcValue);
  }
  assignMergeValue(object, key, newValue);
}

function baseMerge(object, source, srcIndex, customizer, stack) {
  if (object === source) {
    return;
  }
  baseFor(source, function (srcValue, key) {
    stack || (stack = new Stack());
    if (isObject(srcValue)) {
      baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
    } else {
      var newValue = customizer ? customizer(safeGet(object, key), srcValue, key + '', object, source, stack) : undefined;
      if (newValue === undefined) {
        newValue = srcValue;
      }
      assignMergeValue(object, key, newValue);
    }
  }, keysIn);
}

function identity(value) {
  return value;
}

function apply(func, thisArg, args) {
  switch (args.length) {
    case 0:
      return func.call(thisArg);
    case 1:
      return func.call(thisArg, args[0]);
    case 2:
      return func.call(thisArg, args[0], args[1]);
    case 3:
      return func.call(thisArg, args[0], args[1], args[2]);
  }
  return func.apply(thisArg, args);
}

var nativeMax = Math.max;
function overRest(func, start, transform) {
  start = nativeMax(start === undefined ? func.length - 1 : start, 0);
  return function () {
    var args = arguments,
      index = -1,
      length = nativeMax(args.length - start, 0),
      array = Array(length);
    while (++index < length) {
      array[index] = args[start + index];
    }
    index = -1;
    var otherArgs = Array(start + 1);
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = transform(array);
    return apply(func, this, otherArgs);
  };
}

function constant(value) {
  return function () {
    return value;
  };
}

var baseSetToString = !defineProperty ? identity : function (func, string) {
  return defineProperty(func, 'toString', {
    'configurable': true,
    'enumerable': false,
    'value': constant(string),
    'writable': true
  });
};
var baseSetToString$1 = baseSetToString;

var HOT_COUNT = 800,
  HOT_SPAN = 16;
var nativeNow = Date.now;
function shortOut(func) {
  var count = 0,
    lastCalled = 0;
  return function () {
    var stamp = nativeNow(),
      remaining = HOT_SPAN - (stamp - lastCalled);
    lastCalled = stamp;
    if (remaining > 0) {
      if (++count >= HOT_COUNT) {
        return arguments[0];
      }
    } else {
      count = 0;
    }
    return func.apply(undefined, arguments);
  };
}

var setToString = shortOut(baseSetToString$1);

function baseRest(func, start) {
  return setToString(overRest(func, start, identity), func + '');
}

function isIterateeCall(value, index, object) {
  if (!isObject(object)) {
    return false;
  }
  var type = typeof index;
  if (type == 'number' ? isArrayLike(object) && isIndex(index, object.length) : type == 'string' && index in object) {
    return eq(object[index], value);
  }
  return false;
}

function createAssigner(assigner) {
  return baseRest(function (object, sources) {
    var index = -1,
      length = sources.length,
      customizer = length > 1 ? sources[length - 1] : undefined,
      guard = length > 2 ? sources[2] : undefined;
    customizer = assigner.length > 3 && typeof customizer == 'function' ? (length--, customizer) : undefined;
    if (guard && isIterateeCall(sources[0], sources[1], guard)) {
      customizer = length < 3 ? undefined : customizer;
      length = 1;
    }
    object = Object(object);
    while (++index < length) {
      var source = sources[index];
      if (source) {
        assigner(object, source, index, customizer);
      }
    }
    return object;
  });
}

var merge = createAssigner(function (object, source, srcIndex) {
  baseMerge(object, source, srcIndex);
});

function configInherit(baseObj, ...objs) {
  const copy = cloneDeep(baseObj);
  const combination = merge(copy, ...objs);
  return combination;
}

var stringTag = '[object String]';
function isString(value) {
  return typeof value == 'string' || !isArray(value) && isObjectLike(value) && baseGetTag(value) == stringTag;
}

function isNull(value) {
  return value === null;
}

function isUndefined(value) {
  return value === undefined;
}

const existValue = value => !isUndefined(value) && !isNull(value);
class ValidationError extends Error {
  name = "ValidationError";
  constructor(options) {
    let message = "";
    if (isString(options)) message = options;else {
      const {
        value,
        min,
        max,
        equality,
        measurement,
        required,
        type,
        instance
      } = options;
      let {
        prop
      } = options;
      message = options?.message ?? "";
      if (measurement && measurement !== "self") prop += `.${measurement}`;
      if (!message) {
        message = `Parameter '${prop}' `;
        if (required) message += "is required";else if (existValue(type)) message += `should be '${type}' type`;else if (existValue(instance)) message += `should be instance of '${instance}'`;else if (existValue(equality)) message += `should be equal to '${equality}'`;else if (existValue(min) && !existValue(max)) message += `should be greater than or equal to '${min}'`;else if (existValue(max) && !existValue(min)) message += `should be less than or equal to '${max}'`;else if (existValue(min) && existValue(max)) message += `should be within the range of '${min}' and '${max}'`;else message += "validaiton failed";
        message += `, but received '${value}'.`;
      }
    }
    super(message);
  }
}

let FunctionalValidator = class FunctionalValidator {
  typeCheck;
  constructor(typeCheck) {
    this.typeCheck = typeCheck;
  }
  validate(option) {
    const {
      rule,
      param,
      value
    } = option;
    if (this.isCustomValidator(rule)) {
      rule(param, value);
    } else if (this.isPrototype(rule)) {
      this.instanceValidator(option);
    }
  }
  isPrototype(rule) {
    return this.typeCheck.isFunction(rule) && !rule?._karman;
  }
  isCustomValidator(rule) {
    return this.typeCheck.isFunction(rule) && rule?._karman;
  }
  instanceValidator(option) {
    const {
      param,
      value
    } = option;
    const rule = option.rule;
    if (!(value instanceof rule)) {
      throw new ValidationError({
        prop: param,
        value,
        instance: rule
      });
    }
  }
};
FunctionalValidator = __decorate([Injectable(), __metadata("design:paramtypes", [TypeCheck])], FunctionalValidator);
var FunctionalValidator$1 = FunctionalValidator;

let ParameterDescriptorValidator = class ParameterDescriptorValidator {
  typeCheck;
  constructor(typeCheck) {
    this.typeCheck = typeCheck;
  }
  validate(option) {
    const {
      rule,
      param,
      value
    } = option;
    if (!this.isParameterDescriptor(rule)) {
      return;
    }
    const {
      measurement = "self",
      min,
      max,
      equality
    } = rule;
    const target = this.getMeasureTarget(value, measurement);
    this.rangeValidator({
      min,
      max,
      equality,
      param,
      value: target,
      measurement
    });
  }
  isParameterDescriptor(rule) {
    const isObject = this.typeCheck.isObjectLiteral(rule);
    const _rule = rule;
    const hasDescriptorKeys = [_rule?.min, _rule?.max, _rule?.equality, _rule?.measurement].some(des => !this.typeCheck.isUndefinedOrNull(des));
    return isObject && hasDescriptorKeys;
  }
  getMeasureTarget(value, measurement) {
    if (measurement === "self") {
      return value;
    }
    const target = value[measurement];
    if (this.typeCheck.isUndefinedOrNull(target)) {
      console.warn(`Cannot find property "${measurement}" on "${value}".`);
    }
    return target;
  }
  rangeValidator(option) {
    const {
      equality,
      min,
      max,
      value,
      param,
      measurement
    } = option;
    let valid = null;
    if (!this.typeCheck.isUndefinedOrNull(equality)) {
      valid = equality === value;
    } else if (!this.typeCheck.isUndefinedOrNull(min)) {
      valid = min <= value;
    } else if (!this.typeCheck.isUndefinedOrNull(max)) {
      valid = max >= value;
    }
    const prop = measurement && measurement !== "self" ? `${param}.${measurement}` : param;
    if (!this.typeCheck.isNull(valid) && !valid) throw new ValidationError({
      prop,
      value,
      equality,
      min,
      max
    });
  }
};
ParameterDescriptorValidator = __decorate([Injectable(), __metadata("design:paramtypes", [TypeCheck])], ParameterDescriptorValidator);
var ParameterDescriptorValidator$1 = ParameterDescriptorValidator;

class RegExpValidator {
  validate(option) {
    const {
      rule,
      param,
      value
    } = option;
    const legal = this.isLegalRegExp(rule);
    if (!legal) {
      return;
    }
    const validateStrategy = this.getStrategy(rule);
    validateStrategy({
      rule,
      param,
      value
    });
  }
  isPureRegExp(rule) {
    return rule instanceof RegExp;
  }
  isRegExpWithMessage(rule) {
    return rule?.regexp instanceof RegExp;
  }
  isLegalRegExp(rule) {
    return this.isPureRegExp(rule) || this.isRegExpWithMessage(rule);
  }
  getStrategy(rule) {
    if (this.isPureRegExp(rule)) {
      return this.pureRegExp.bind(this);
    } else if (this.isRegExpWithMessage(rule)) {
      return this.regExpWithMessage.bind(this);
    } else {
      throw new Error("no matched validate strategy");
    }
  }
  pureRegExp(option) {
    const {
      param,
      value
    } = option;
    const valid = option.rule.test(value);
    if (!valid) {
      throw new ValidationError({
        prop: param,
        value
      });
    }
  }
  regExpWithMessage(option) {
    const {
      param,
      value
    } = option;
    const {
      errorMessage,
      regexp
    } = option.rule;
    const valid = regexp.test(value);
    if (!valid) {
      throw new ValidationError({
        prop: param,
        value,
        message: errorMessage
      });
    }
  }
}

let TypeValidator = class TypeValidator {
  typeCheck;
  constructor(typeCheck) {
    this.typeCheck = typeCheck;
  }
  validate(option) {
    const {
      rule,
      param,
      value
    } = option;
    if (!this.typeCheck.isString(rule)) {
      return;
    }
    const type = rule.toLowerCase();
    const legal = this.legalType(type);
    if (!legal) {
      console.warn(`[karman warn] invalid type "${type}" was provided in rules for parameter "${param}"`);
      return;
    }
    const validator = this.getValidator(type);
    const valid = validator(value);
    if (!valid) {
      throw new ValidationError({
        prop: param,
        value,
        type
      });
    }
  }
  legalType(type) {
    if (this.typeCheck.TypeSet.includes(type)) {
      return true;
    }
    return false;
  }
  getValidator(type) {
    const methodName = this.typeCheck.CorrespondingMap[type];
    const validator = this.typeCheck[methodName];
    return validator;
  }
};
TypeValidator = __decorate([Injectable(), __metadata("design:paramtypes", [TypeCheck])], TypeValidator);
var TypeValidator$1 = TypeValidator;

class RuleSet {
  rules;
  errors = [];
  get valid() {
    return true;
  }
  constructor(...rules) {
    this.rules = rules;
  }
  execute(callbackfn) {
    this.rules.forEach((value, index, array) => {
      try {
        callbackfn(value, index, array);
      } catch (error) {
        if (error instanceof Error) {
          this.errors.push(error);
        }
      }
    });
    if (!this.valid) {
      throw this.errors[0];
    }
  }
}

class UnionRules extends RuleSet {
  get valid() {
    return this.rules.length > this.errors.length;
  }
  constructor(...rules) {
    super(...rules);
  }
}

class IntersectionRules extends RuleSet {
  get valid() {
    return !this.errors.length;
  }
  constructor(...rules) {
    super(...rules);
  }
}

let ValidationEngine = class ValidationEngine {
  functionalValidator;
  parameterDescriptorValidator;
  regexpValidator;
  typeValidator;
  typeCheck;
  template;
  constructor(functionalValidator, parameterDescriptorValidator, regexpValidator, typeValidator, typeCheck, template) {
    this.functionalValidator = functionalValidator;
    this.parameterDescriptorValidator = parameterDescriptorValidator;
    this.regexpValidator = regexpValidator;
    this.typeValidator = typeValidator;
    this.typeCheck = typeCheck;
    this.template = template;
  }
  isValidationError(error) {
    return error instanceof ValidationError;
  }
  defineCustomValidator(validatefn) {
    if (!this.typeCheck.isFunction(validatefn)) {
      throw new TypeError("Invalid validator type.");
    }
    Object.defineProperty(validatefn, "_karman", {
      value: true
    });
    return validatefn;
  }
  defineUnionRules(...rules) {
    return new UnionRules(...rules);
  }
  defineIntersectionRules(...rules) {
    return new IntersectionRules(...rules);
  }
  getMainValidator(payload, payloadDef) {
    const validatorQueue = [];
    Object.entries(payloadDef).forEach(([param, paramDef]) => {
      const value = payload[param];
      const {
        rules,
        required
      } = this.getRules(param, paramDef);
      if (!rules) return;
      const validator = this.getValidatorByRules(rules, required);
      validatorQueue.push(() => validator(param, value));
    });
    const mainValidator = () => validatorQueue.forEach(validator => validator());
    return mainValidator;
  }
  getRules(param, paramDef) {
    const {
      rules,
      required
    } = paramDef;
    if (!rules) {
      this.template.warn(`Cannot find certain rules for parameter "${param}".`);
      return {};
    }
    return {
      rules,
      required
    };
  }
  ruleSetAdapter(rules, required) {
    const validator = (param, value) => {
      rules.execute(rule => {
        this.validateInterface({
          rule,
          param,
          value,
          required
        });
      });
    };
    return validator.bind(this);
  }
  getValidatorByRules(rules, required = false) {
    if (rules instanceof RuleSet) {
      return this.ruleSetAdapter(rules, required);
    } else if (this.typeCheck.isArray(rules)) {
      const ruleSet = new IntersectionRules(...rules);
      return this.ruleSetAdapter(ruleSet, required);
    } else {
      const validator = (param, value) => {
        this.validateInterface({
          rule: rules,
          param,
          value,
          required
        });
      };
      return validator;
    }
  }
  requiredValidator(param, value, required) {
    const empty = this.typeCheck.isUndefinedOrNull(value);
    if (!empty) return true;
    if (required && empty) throw new ValidationError({
      prop: param,
      value,
      required
    });
    return false;
  }
  validateInterface(option) {
    const {
      param,
      value,
      required
    } = option;
    const requiredValidation = this.requiredValidator(param, value, required);
    if (!requiredValidation) return;
    this.typeValidator.validate(option);
    this.regexpValidator.validate(option);
    this.functionalValidator.validate(option);
    this.parameterDescriptorValidator.validate(option);
  }
};
ValidationEngine = __decorate([Injectable(), __metadata("design:paramtypes", [FunctionalValidator$1, ParameterDescriptorValidator$1, RegExpValidator, TypeValidator$1, TypeCheck, Template])], ValidationEngine);
var ValidationEngine$1 = ValidationEngine;

let Fetch = class Fetch {
  typeCheck;
  template;
  constructor(typeCheck, template) {
    this.typeCheck = typeCheck;
    this.template = template;
  }
  request(payload, config) {
    const {
      url,
      method = "GET",
      auth,
      timeout,
      timeoutErrorMessage,
      responseType,
      headers,
      credentials,
      integrity,
      keepalive,
      mode,
      redirect,
      referrer,
      referrerPolicy,
      requestCache,
      window
    } = config;
    const _method = method.toUpperCase();
    const _headers = this.getHeaders(headers, auth);
    const fetchConfig = {
      method: _method,
      headers: _headers,
      body: payload,
      credentials,
      integrity,
      keepalive,
      mode,
      redirect,
      referrer,
      referrerPolicy,
      cache: requestCache,
      window
    };
    const initObject = this.initFetch(url, fetchConfig, {
      responseType,
      timeout,
      timeoutErrorMessage
    });
    return {
      ...initObject,
      config
    };
  }
  buildTimeout(timeoutOptions) {
    const {
      timeout,
      timeoutErrorMessage,
      abortObject
    } = timeoutOptions;
    if (!this.typeCheck.isNumber(timeout) || timeout < 1) return;
    const t = setTimeout(() => {
      abortObject.abort();
      clearTimeout(t);
    }, timeout);
    return {
      clearTimer: () => clearTimeout(t),
      TOMessage: timeoutErrorMessage || `time of ${timeout}ms exceeded`
    };
  }
  initFetch(url, config, addition) {
    const promiseUninitWarn = () => this.template.warn("promise resolver hasn't been initialized");
    const {
      responseType,
      timeout,
      timeoutErrorMessage
    } = addition;
    const {
      method
    } = config;
    const requestKey = `fetch:${method}:${url}`;
    if (method === "GET" || method === "HEAD") config.body = null;
    const abortObject = {
      abort: () => this.template.warn("Failed to abort request.")
    };
    const {
      clearTimer,
      TOMessage
    } = this.buildTimeout({
      timeout,
      timeoutErrorMessage,
      abortObject
    }) ?? {};
    const request = () => {
      const abortController = new AbortController();
      const signal = abortController.signal;
      abortObject.abort = abortController.abort.bind(abortController);
      return fetch(url, {
        ...config,
        signal
      });
    };
    const promiseExecutor = {
      resolve: promiseUninitWarn,
      reject: promiseUninitWarn
    };
    let response = null;
    const requestPromise = new Promise((_resolve, _reject) => {
      promiseExecutor.resolve = value => {
        _resolve(value);
        clearTimer?.();
      };
      promiseExecutor.reject = reason => {
        _reject(reason);
        clearTimer?.();
      };
      abortObject.abort = reason => {
        if (this.typeCheck.isString(reason)) reason = new Error(reason);
        _reject(reason);
      };
    }).then(res => {
      if (!(res instanceof Response)) return res;
      const type = res.headers.get("Content-Type");
      if (!response) response = {};
      response.url = res.url;
      response.bodyUsed = res.bodyUsed;
      response.headers = res.headers;
      response.ok = res.ok;
      response.redirected = res.redirected;
      response.status = res.status;
      response.statusText = res.statusText;
      response.type = res.type;
      if (type?.includes("json") || responseType === "json") return res.json();
      if (responseType === "blob") return res.blob();
      if (responseType === "arraybuffer") return res.arrayBuffer();
      return res;
    }).then(body => {
      if (!(body instanceof Response) && response) return {
        ...response,
        body
      };
      return body;
    });
    const requestWrapper = async () => {
      try {
        promiseExecutor.resolve(await request());
      } catch (error) {
        let _error = null;
        if (error instanceof DOMException && error.message.includes("abort") && TOMessage) _error = new Error(TOMessage);
        promiseExecutor.reject(_error ?? error);
      }
    };
    const requestExecutor = send => {
      if (send) requestWrapper();
      return [requestPromise, abortObject.abort];
    };
    return {
      requestKey,
      promiseExecutor,
      requestExecutor
    };
  }
  getHeaders(headers, auth) {
    return merge({}, headers, this.getAuthHeaders(auth));
  }
  getAuthHeaders(auth) {
    let {
      password
    } = auth ?? {};
    const {
      username
    } = auth ?? {};
    if (this.typeCheck.isUndefinedOrNull(username) || this.typeCheck.isUndefinedOrNull(password)) return;
    password = decodeURIComponent(encodeURIComponent(password));
    const Authorization = "Basic " + btoa(username + ":" + password);
    return {
      Authorization
    };
  }
};
Fetch = __decorate([Injectable(), __metadata("design:paramtypes", [TypeCheck, Template])], Fetch);
var Fetch$1 = Fetch;

let ApiFactory = class ApiFactory {
  typeCheck;
  pathResolver;
  validationEngine;
  xhr;
  fetch;
  cachePipe;
  template;
  constructor(typeCheck, pathResolver, validationEngine, xhr, fetch, cachePipe, template) {
    this.typeCheck = typeCheck;
    this.pathResolver = pathResolver;
    this.validationEngine = validationEngine;
    this.xhr = xhr;
    this.fetch = fetch;
    this.cachePipe = cachePipe;
    this.template = template;
  }
  createAPI(apiConfig) {
    const {
      $$apiConfig,
      $$requestConfig,
      $$cacheConfig,
      $$utilConfig,
      $$hooks
    } = this.apiConfigParser(apiConfig);
    const _af = this;
    let runtimeOptionsCache = null;
    const allConfigCache = $$apiConfig;
    const setRuntimeOptionsCache = cache => {
      runtimeOptionsCache = cache;
    };
    function finalAPI(payload, runtimeOptions) {
      const runtimeOptionsCopy = _af.runtimeOptionsParser(runtimeOptions);
      if (_af.typeCheck.isUndefinedOrNull(payload)) payload = {};
      _af.configInheritance.call(this, {
        allConfigCache,
        runtimeOptions: runtimeOptionsCopy,
        runtimeCache: runtimeOptionsCache,
        createdOptions: {
          $$requestConfig,
          $$cacheConfig,
          $$utilConfig,
          $$hooks
        },
        setRuntimeCache: setRuntimeOptionsCache
      });
      const {
        endpoint = "",
        method = "GET",
        payloadDef = {},
        baseURL = "",
        requestConfig = {},
        cacheConfig,
        utilConfig,
        hooks,
        interceptors
      } = allConfigCache;
      const {
        requestStrategy = "xhr",
        headers
      } = requestConfig;
      const {
        validation
      } = utilConfig ?? {};
      const {
        onBeforeValidate,
        onRebuildPayload,
        onBeforeRequest,
        onError,
        onFinally,
        onSuccess
      } = hooks ?? {};
      const {
        onRequest,
        onResponse
      } = interceptors ?? {};
      if (validation) {
        _af.hooksInvocator(this, onBeforeValidate, payloadDef, payload);
        const validator = _af.validationEngine.getMainValidator(payload, payloadDef);
        validator();
      }
      const _payload = _af.hooksInvocator(this, onRebuildPayload, payload);
      const [requestURL, requestBody] = _af.preqBuilder.call(_af, {
        baseURL,
        endpoint,
        payload: _payload,
        payloadDef
      });
      let _requestBody = _af.hooksInvocator(this, onBeforeRequest, requestURL, requestBody);
      _requestBody ??= headers?.["Content-Type"]?.includes("json") && _af.typeCheck.isObjectLiteral(requestBody) ? JSON.stringify(requestBody) : requestBody;
      const httpConfig = {
        url: requestURL,
        method,
        ...requestConfig
      };
      _af.hooksInvocator(this, onRequest, httpConfig);
      const reqStrategy = _af.requestStrategySelector(requestStrategy);
      const {
        requestKey,
        requestExecutor,
        promiseExecutor,
        config
      } = reqStrategy.request(_requestBody, httpConfig);
      if (cacheConfig?.cache) {
        const {
          cacheExpireTime,
          cacheStrategy
        } = cacheConfig;
        const cacheExecuter = _af.cachePipe.chain({
          requestKey,
          requestExecutor,
          promiseExecutor,
          config,
          payload
        }, {
          cacheStrategyType: cacheStrategy,
          expiration: cacheExpireTime
        });
        const [chainPromise, abortController] = cacheExecuter();
        const _chainPromise = _af.installHooks(this, chainPromise, {
          onSuccess,
          onError,
          onFinally,
          onResponse
        });
        return [_chainPromise, abortController];
      }
      const [requestPromise, abortController] = requestExecutor(true);
      const _requestPromise = _af.installHooks(this, requestPromise, {
        onSuccess,
        onError,
        onFinally,
        onResponse
      });
      return [_requestPromise, abortController];
    }
    return finalAPI;
  }
  hooksInvocator(k, hooks, ...args) {
    if (this.typeCheck.isFunction(hooks)) return hooks.call(k, ...args);
  }
  configInheritance(options) {
    const {
      allConfigCache,
      runtimeOptions,
      createdOptions,
      runtimeCache,
      setRuntimeCache
    } = options;
    const {
      $$requestConfig,
      $$cacheConfig,
      $$hooks,
      $$utilConfig
    } = createdOptions;
    if (!isEqual(runtimeCache, runtimeOptions)) {
      setRuntimeCache(runtimeOptions);
      const {
        $$$requestConfig,
        $$$cacheConfig,
        $$$utilConfig,
        $$$hooks
      } = runtimeOptions;
      const {
        $baseURL,
        $requestConfig,
        $cacheConfig,
        $interceptors
      } = this;
      const $utilConfig = {
        validation: this.$validation
      };
      const requestConfig = configInherit($requestConfig, $$requestConfig, $$$requestConfig);
      const cacheConfig = configInherit($cacheConfig, $$cacheConfig, $$$cacheConfig);
      const utilConfig = configInherit($utilConfig, $$utilConfig, $$$utilConfig);
      const hooks = configInherit($$hooks, $$$hooks);
      allConfigCache.baseURL = $baseURL;
      allConfigCache.requestConfig = requestConfig;
      allConfigCache.cacheConfig = cacheConfig;
      allConfigCache.utilConfig = utilConfig;
      allConfigCache.hooks = hooks;
      allConfigCache.interceptors = $interceptors;
    }
  }
  preqBuilder(preqBuilderOptions) {
    const {
      baseURL,
      endpoint,
      payloadDef,
      payload
    } = preqBuilderOptions;
    if (!this.typeCheck.isObjectLiteral(payload)) this.template.throw("payload must be an normal object");
    const urlSources = [baseURL, endpoint];
    const pathParams = [];
    const queryParams = {};
    const requestBody = {};
    Object.entries(payloadDef).forEach(([param, def]) => {
      const {
        path,
        query,
        body
      } = def;
      const value = payload[param];
      if (this.typeCheck.isUndefinedOrNull(value)) return;
      if (this.typeCheck.isNumber(path) && path >= 0) pathParams[path] = `${value}`;
      if (query) queryParams[param] = value;
      if (body) requestBody[param] = value;
    });
    urlSources.push(...pathParams.filter(p => p));
    const requestURL = this.pathResolver.resolveURL({
      paths: urlSources,
      query: queryParams
    });
    return [requestURL, requestBody];
  }
  installHooks(k, reqPromise, {
    onSuccess,
    onError,
    onFinally,
    onResponse
  }) {
    return reqPromise.then(res => {
      if (this.typeCheck.isFunction(onResponse)) onResponse.call(k, res);
      return res;
    }).then(res => new Promise(resolve => {
      if (this.typeCheck.isFunction(onSuccess)) resolve(onSuccess.call(k, res));else resolve(res);
    })).catch(err => new Promise((resolve, reject) => {
      if (this.typeCheck.isFunction(onError)) resolve(onError.call(k, err));else reject(err);
    })).finally(() => new Promise(resolve => {
      if (this.typeCheck.isFunction(onFinally)) resolve(onFinally.call(k));else resolve(void 0);
    }));
  }
  requestStrategySelector(requestStrategy) {
    if (requestStrategy === "xhr" && !this.typeCheck.isUndefinedOrNull(XMLHttpRequest)) return this.xhr;else if (requestStrategy === "fetch" && !this.typeCheck.isUndefinedOrNull(fetch)) return this.fetch;else throw new Error("strategy not found.");
  }
  runtimeOptionsParser(runtimeOptions) {
    const {
      headers,
      auth,
      timeout,
      timeoutErrorMessage,
      responseType,
      headerMap,
      withCredentials,
      requestStrategy,
      credentials,
      integrity,
      keepalive,
      mode,
      redirect,
      referrer,
      referrerPolicy,
      requestCache,
      window,
      cache,
      cacheExpireTime,
      cacheStrategy,
      validation,
      onBeforeValidate,
      onRebuildPayload,
      onBeforeRequest,
      onSuccess,
      onError,
      onFinally
    } = runtimeOptions ?? {};
    const $$$requestConfig = {
      requestStrategy,
      headers,
      auth,
      timeout,
      timeoutErrorMessage,
      responseType,
      headerMap,
      withCredentials,
      credentials,
      integrity,
      keepalive,
      mode,
      redirect,
      referrer,
      referrerPolicy,
      requestCache,
      window
    };
    const $$$cacheConfig = {
      cache,
      cacheExpireTime,
      cacheStrategy
    };
    const $$$utilConfig = {
      validation
    };
    const $$$hooks = {
      onBeforeValidate,
      onRebuildPayload,
      onBeforeRequest,
      onSuccess,
      onError,
      onFinally
    };
    return cloneDeep({
      $$$requestConfig,
      $$$cacheConfig,
      $$$utilConfig,
      $$$hooks
    });
  }
  apiConfigParser(apiConfig) {
    const {
      endpoint,
      method,
      payloadDef,
      requestStrategy,
      headers,
      auth,
      timeout,
      timeoutErrorMessage,
      responseType,
      headerMap,
      withCredentials,
      credentials,
      integrity,
      keepalive,
      mode,
      redirect,
      referrer,
      referrerPolicy,
      requestCache,
      window,
      cache,
      cacheExpireTime,
      cacheStrategy,
      validation,
      scheduleInterval,
      onBeforeValidate,
      onRebuildPayload,
      onBeforeRequest,
      onSuccess,
      onError,
      onFinally
    } = apiConfig ?? {};
    const $$apiConfig = {
      endpoint,
      method,
      payloadDef
    };
    const $$requestConfig = {
      headers,
      auth,
      timeout,
      timeoutErrorMessage,
      responseType,
      headerMap,
      withCredentials,
      requestStrategy,
      credentials,
      integrity,
      keepalive,
      mode,
      redirect,
      referrer,
      referrerPolicy,
      requestCache,
      window
    };
    const $$cacheConfig = {
      cache,
      cacheExpireTime,
      cacheStrategy
    };
    const $$utilConfig = {
      validation,
      scheduleInterval
    };
    const $$hooks = {
      onBeforeValidate,
      onRebuildPayload,
      onBeforeRequest,
      onSuccess,
      onError,
      onFinally
    };
    return cloneDeep({
      $$apiConfig,
      $$requestConfig,
      $$cacheConfig,
      $$utilConfig,
      $$hooks
    });
  }
};
ApiFactory = __decorate([Injectable(), __metadata("design:paramtypes", [TypeCheck, PathResolver, ValidationEngine$1, Xhr$1, Fetch$1, CachePipe$1, Template])], ApiFactory);
var ApiFactory$1 = ApiFactory;

var numberTag = '[object Number]';
function isNumber(value) {
  return typeof value == 'number' || isObjectLike(value) && baseGetTag(value) == numberTag;
}

var boolTag = '[object Boolean]';
function isBoolean(value) {
  return value === true || value === false || isObjectLike(value) && baseGetTag(value) == boolTag;
}

const HOUR = 60 * 60 * 60 * 1000;
class Karman {
  _typeCheck;
  _pathResolver;
  #root = false;
  get $root() {
    return this.#root;
  }
  set $root(value) {
    if (isBoolean(value)) this.#root = value;
  }
  #parant = null;
  get $parent() {
    return this.#parant;
  }
  set $parent(value) {
    if (value instanceof Karman) this.#parant = value;
  }
  #baseURL = "";
  get $baseURL() {
    return this.#baseURL;
  }
  set $baseURL(value) {
    if (!isString(value)) return;
    this.#baseURL = value;
  }
  $cacheConfig = {
    cache: false,
    cacheExpireTime: HOUR,
    cacheStrategy: "memory"
  };
  $requestConfig = {};
  $interceptors = {};
  #validation;
  get $validation() {
    return this.#validation;
  }
  set $validation(value) {
    if (isBoolean(value)) this.#validation = value;
  }
  #scheduleInterval;
  get $scheduleInterval() {
    return this.#scheduleInterval;
  }
  set $scheduleInterval(value) {
    if (isNumber(value)) this.#scheduleInterval = value;
  }
  #inherited = false;
  constructor(config) {
    const {
      root,
      url,
      validation,
      scheduleInterval,
      cache,
      cacheExpireTime,
      cacheStrategy,
      headers,
      auth,
      timeout,
      timeoutErrorMessage,
      responseType,
      headerMap,
      withCredentials,
      credentials,
      integrity,
      keepalive,
      mode,
      redirect,
      referrer,
      referrerPolicy,
      requestCache,
      window,
      onRequest,
      onResponse
    } = config ?? {};
    this.$baseURL = url ?? "";
    this.$root = root;
    this.$validation = validation;
    this.$scheduleInterval = scheduleInterval;
    this.$cacheConfig = {
      cache,
      cacheExpireTime,
      cacheStrategy
    };
    this.$requestConfig = {
      headers,
      auth,
      timeout,
      timeoutErrorMessage,
      responseType,
      headerMap,
      withCredentials,
      credentials,
      integrity,
      keepalive,
      mode,
      redirect,
      referrer,
      referrerPolicy,
      requestCache,
      window
    };
    this.$interceptors = {
      onRequest,
      onResponse
    };
  }
  $mount(o, name = "$karman") {
    Object.defineProperty(o, name, {
      value: this
    });
  }
  $use(plugin) {
    if (!this.$root) throw new Error("[karman error] plugins can only be installed from the root Karman!");
    if (!isFunction(plugin?.install)) throw new TypeError("[karman error] plugin must has an install function!");
    plugin.install(this);
    const onTraverse = k => {
      if (!(k instanceof Karman)) return;
      plugin.install(k);
      k.$traverseInstanceTree({
        onTraverse
      });
    };
    this.$traverseInstanceTree({
      onTraverse
    });
  }
  $inherit() {
    if (this.#inherited) return;
    if (this.$parent) {
      const {
        $baseURL,
        $requestConfig,
        $cacheConfig,
        $interceptors,
        $validation,
        $scheduleInterval
      } = this.$parent;
      this.$baseURL = this._pathResolver.resolve($baseURL, this.$baseURL);
      this.$requestConfig = configInherit($requestConfig, this.$requestConfig);
      this.$cacheConfig = configInherit($cacheConfig, this.$cacheConfig);
      this.$interceptors = configInherit($interceptors, this.$interceptors);
      if (this._typeCheck.isUndefined(this.$validation)) this.$validation = $validation;
      if (this._typeCheck.isUndefined(this.$scheduleInterval)) this.$scheduleInterval = $scheduleInterval;
    }
    this.$invokeChildrenInherit();
  }
  $setDependencies(...deps) {
    deps.forEach(dep => {
      if (dep instanceof TypeCheck) this._typeCheck = dep;else if (dep instanceof PathResolver) this._pathResolver = dep;
    });
  }
  $requestGuard(request) {
    return (...args) => {
      if (!this.#inherited) console.warn(
      "[karman warn] Inherit event on Karman tree hasn't been triggered, please make sure you have specified the root Karman layer.");
      return request(...args);
    };
  }
  $invokeChildrenInherit() {
    this.$traverseInstanceTree({
      onTraverse: prop => {
        if (prop instanceof Karman) prop.$inherit();
      },
      onTraverseEnd: () => {
        this.#inherited = true;
      }
    });
  }
  $traverseInstanceTree({
    onTraverse,
    onTraverseEnd
  }, instance = this) {
    Object.values(instance).forEach(onTraverse);
    onTraverseEnd?.();
  }
}

let LayerBuilder = class LayerBuilder {
  typeCheck;
  scheduledTask;
  pathResolver;
  template;
  constructor(typeCheck, scheduledTask, pathResolver, template) {
    this.typeCheck = typeCheck;
    this.scheduledTask = scheduledTask;
    this.pathResolver = pathResolver;
    this.template = template;
  }
  configure(k) {
    const {
      root,
      url,
      validation,
      scheduleInterval,
      cache,
      cacheExpireTime,
      cacheStrategy,
      headers,
      auth,
      timeout,
      timeoutErrorMessage,
      responseType,
      headerMap,
      withCredentials,
      credentials,
      integrity,
      keepalive,
      mode,
      redirect,
      referrer,
      referrerPolicy,
      requestCache,
      window,
      onRequest,
      onResponse,
      api,
      route
    } = k;
    const currentKarman = this.createKarman({
      root,
      url,
      validation,
      cache,
      cacheExpireTime,
      cacheStrategy,
      headers,
      auth,
      timeout,
      timeoutErrorMessage,
      responseType,
      headerMap,
      withCredentials,
      credentials,
      integrity,
      keepalive,
      mode,
      redirect,
      referrer,
      referrerPolicy,
      requestCache,
      window,
      onRequest,
      onResponse
    });
    currentKarman.$setDependencies(this.typeCheck, this.pathResolver);
    if (this.typeCheck.isObjectLiteral(route)) Object.entries(route).forEach(([key, karman]) => {
      if (karman.$root) this.template.throw("Detected that the 'root' property is set to 'true' on a non-root Karman node.");
      karman.$parent = currentKarman;
      Object.defineProperty(currentKarman, key, {
        value: karman,
        enumerable: true
      });
    });
    if (this.typeCheck.isObjectLiteral(api)) Object.entries(api).forEach(([key, value]) => {
      Object.defineProperty(currentKarman, key, {
        value: currentKarman.$requestGuard(value.bind(currentKarman)),
        enumerable: true
      });
    });
    if (root) {
      this.scheduledTask.setInterval(scheduleInterval);
      currentKarman.$inherit();
    }
    return currentKarman;
  }
  createKarman(k) {
    return new Karman(k);
  }
};
LayerBuilder = __decorate([Injectable(), __metadata("design:paramtypes", [TypeCheck, ScheduledTask$1, PathResolver, Template])], LayerBuilder);
var LayerBuilder$1 = LayerBuilder;

let default_1 = class {
  ApiFactory;
  LayerBuilder;
  ValidationEngine;
};
default_1 = __decorate([IOCContainer({
  imports: [CachePipe$1, ApiFactory$1, LayerBuilder$1, Xhr$1, Fetch$1, ScheduledTask$1, FunctionalValidator$1, ParameterDescriptorValidator$1, RegExpValidator, TypeValidator$1, ValidationEngine$1],
  provides: [MemoryCache, LocalStorageCache, SessionStorageCache, PathResolver, TypeCheck, Template],
  exports: [ApiFactory$1, LayerBuilder$1, ValidationEngine$1]
})], default_1);
var core = default_1;

const facade = new core();
const defineKarman = facade.LayerBuilder.configure.bind(facade.LayerBuilder);
const defineAPI = facade.ApiFactory.createAPI.bind(facade.ApiFactory);
const isValidationError = facade.ValidationEngine.isValidationError.bind(facade.ValidationEngine);
const defineCustomValidator = facade.ValidationEngine.defineCustomValidator.bind(facade.ValidationEngine);
const defineIntersectionRules = facade.ValidationEngine.defineIntersectionRules.bind(facade.ValidationEngine);
const defineUnionRules = facade.ValidationEngine.defineUnionRules.bind(facade.ValidationEngine);

export { Karman, ValidationError, defineAPI, defineCustomValidator, defineIntersectionRules, defineKarman, defineUnionRules, isValidationError };
