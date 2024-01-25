export class Karman {
    $baseURL = ''

    $position = {
        path(n) {
            return `path:${n}`
        },
        query() {
            return 'query'
        },
        body() {
            return 'body'
        }
    }

    /**
     * @param {string} baseURL 
     * @param {string} route 
     */
    constructor(baseURL, route) {
        if (typeof baseURL === 'string') this.$baseURL = baseURL
        if (typeof route === 'string') this.$baseURL += '/' + route
    }

    /**
     * @protected
     */
    $createAPI(apiConfig = {}, requestConfig = {}) {
        const { endpoint = '' } = apiConfig
        const requestURL = endpoint ? this.$baseURL + '/' + endpoint : this.$baseURL

        return () => {
            console.log(requestURL)
        }
    }
}