import { defineAPI, defineKarman } from '@vic0627/karman'
import product from './product'
import cart from './cart'
import user from './user'

export default defineKarman({
  url: 'https://fakestoreapi.com',
  headers: {
    'Content-Type': 'application/json; charset=utf-8'
  },
  api: {
    /**
     * ### user login
     */
    login: defineAPI({
      endpoint: 'auth/login',
      method: 'POST',
      requestStrategy: 'fetch',
      payloadDef: {
        /**
         * user name
         * @type {string}
         */
        username: {
          required: true,
          body: true,
          rules: ['string', { min: 1, measurement: 'length' }]
        },
        /**
         * password
         * @type {string}
         */
        password: {
          required: true,
          body: true,
          rules: ['string', { min: 1, measurement: 'length' }]
        }
      },
      onSuccess(res) {
        return res.body
      },
      /**
       * @typedef {object} LoginRes
       * @prop {string} LoginRes.token token of user account
       */
      /**
       * @type {LoginRes}
       */
      dto: null
    })
  },
  route: {
    /**
     * ## product management
     */
    product,
    /**
     * ## product cart management
     */
    cart,
    /**
     * ## user management
     */
    user
  }
})
