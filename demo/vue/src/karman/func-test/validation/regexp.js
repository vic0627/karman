import { defineAPI, defineKarman } from '@vic0627/karman'

const regexp = /^[\w-]+(\.[\w-]+)*@[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*(\.[a-zA-Z]{2,})$/

export default defineKarman({
  api: {
    email: defineAPI({
      payloadDef: {
        /** @type {string} */
        param01: {
          rules: regexp
        }
      }
    }),
    emailWithErrorMessage: defineAPI({
      payloadDef: {
        /** @type {string} */
        param01: {
          rules: { regexp, errorMessage: 'wrong email format' }
        }
      }
    }),
    emailNoErrorMessage: defineAPI({
      payloadDef: {
        /** @type {string} */
        param01: {
          rules: { regexp }
        }
      }
    })
  }
})
