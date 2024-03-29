import { defineKarman } from '@vic0627/karman'
import fakeStore from './fake-store'
import _constant from './utils/constant'
import convertToBase64 from './utils/imageBase64'
import funcTest from './func-test'

const karman = defineKarman({
  root: true,
  validation: true,
  route: {
    /**
     * # fake store API
     */
    fakeStore,
    /**
     * # testing
     */
    funcTest
  }
})

karman.$use(_constant)
karman.$use(convertToBase64)

Object.defineProperty(karman, 'install', {
  value: (app) => {
    app.config.globalProperties.$karman = karman
  }
})

export default karman
