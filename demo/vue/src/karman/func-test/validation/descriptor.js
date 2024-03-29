import { defineKarman, defineAPI } from '@vic0627/karman'

export default defineKarman({
  api: {
    min: defineAPI({
      payloadDef: {
        /** @type {number} */
        param01: {
          rules: {
            min: 1
          }
        }
      }
    }),
    max: defineAPI({
      payloadDef: {
        /** @type {number} */
        param01: {
          rules: {
            max: 10
          }
        }
      }
    }),
    minAndMax: defineAPI({
      payloadDef: {
        /** @type {number} */
        param01: {
          rules: {
            min: 1,
            max: 10
          }
        }
      }
    }),
    equality: defineAPI({
      payloadDef: {
        /** @type {number} */
        param01: {
          rules: {
            equality: 0
          }
        }
      }
    }),
    length: defineAPI({
      payloadDef: {
        /** @type {string | Array<any>} */
        param01: {
          rules: {
            min: 1,
            max: 10,
            measurement: 'length'
          }
        }
      }
    }),
    size: defineAPI({
      payloadDef: {
        /** @type {File | Blob} */
        param01: {
          rules: {
            min: 1,
            max: 10,
            measurement: 'size'
          }
        }
      }
    })
  }
})
