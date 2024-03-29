import { defineKarman, defineAPI, defineCustomValidator, ValidationError } from '@vic0627/karman'

const customValidator = defineCustomValidator((param, value) => {
  if (value !== 'karman')
    throw new ValidationError(`'${param}' must be in type 'karman' but received '${value}'`)
})

export default defineKarman({
  api: {
    custom: defineAPI({
      payloadDef: {
        /** @type {'karman'} */
        param01: customValidator
      }
    })
  }
})
