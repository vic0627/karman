import { defineAPI, defineKarman } from '@vic0627/karman'

export default defineKarman({
  api: {
    char: defineAPI({
      payloadDef: {
        /** @type {string} */
        param01: {
          rules: 'char'
        }
      }
    }),
    string: defineAPI({
      payloadDef: {
        /** @type {string} */
        param01: {
          rules: 'string'
        }
      }
    }),
    int: defineAPI({
      payloadDef: {
        /** @type {number} */
        param01: {
          rules: 'int'
        }
      }
    }),
    number: defineAPI({
      payloadDef: {
        /** @type {number} */
        param01: {
          rules: 'number'
        }
      }
    }),
    nan: defineAPI({
      payloadDef: {
        /** @type {number} */
        param01: {
          rules: 'nan'
        }
      }
    }),
    boolean: defineAPI({
      payloadDef: {
        /** @type {boolean} */
        param01: {
          rules: 'boolean'
        }
      }
    }),
    object: defineAPI({
      payloadDef: {
        /** @type {object} */
        param01: {
          rules: 'object'
        }
      }
    }),
    null: defineAPI({
      payloadDef: {
        /** @type {null} */
        param01: {
          rules: 'null'
        }
      }
    }),
    function: defineAPI({
      payloadDef: {
        /** @type {Function} */
        param01: {
          rules: 'function'
        }
      }
    }),
    array: defineAPI({
      payloadDef: {
        /** @type {Array<any>} */
        param01: {
          rules: 'array'
        }
      }
    }),
    objectLiteral: defineAPI({
      payloadDef: {
        /** @type {Record<string | symbol | number, any>} */
        param01: {
          rules: 'object-literal'
        }
      }
    }),
    undefined: defineAPI({
      payloadDef: {
        /** @type {undefined} */
        param01: {
          rules: 'undefined'
        }
      }
    }),
    bigint: defineAPI({
      payloadDef: {
        /** @type {bigint} */
        param01: {
          rules: 'bigint'
        }
      }
    }),
    symbol: defineAPI({
      payloadDef: {
        /** @type {symbol} */
        param01: {
          rules: 'symbol'
        }
      }
    }),
    unidentified: defineAPI({
      payloadDef: {
        /** @type {unknown} */
        param01: {
          rules: 'foo'
        }
      }
    })
  }
})
