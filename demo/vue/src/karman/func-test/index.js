import { defineKarman } from '@vic0627/karman'
import stringType from './validation/string-type'
import constructor from './validation/constructor'
import regexp from './validation/regexp'
import validator from './validation/validator'
import descriptor from './validation/descriptor'

export default defineKarman({
  route: {
    stringType,
    constructor,
    regexp,
    validator,
    descriptor
  }
})
