import { defineAPI, defineKarman } from '@vic0627/karman'

export default defineKarman({
  api: {
    blob: defineAPI({
      payloadDef: {
        /** @type {Blob} */
        param01: {
          rules: Blob
        }
      }
    }),
    date: defineAPI({
      payloadDef: {
        /** @type {Date} */
        param01: {
          rules: Date
        }
      }
    }),
    file: defineAPI({
      payloadDef: {
        /** @type {File} */
        param01: {
          rules: File
        }
      }
    })
  }
})
