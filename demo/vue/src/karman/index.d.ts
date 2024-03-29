import karman from './karman'

export default karman

declare module 'vue' {
  interface ComponentCustomProperties {
    $karman: typeof karman
  }
  interface Vue {
    $karman: typeof karman
  }
}
