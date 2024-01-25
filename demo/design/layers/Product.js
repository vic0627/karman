import { Karman } from "../super/karman";

const productIdDef = (required) => {
    const def = {
        path: 1,
        rules: ['number','min=0']
    }

    if (required) def.rules.push('required')

    return def
}

const limitAndSortDef = {
    limit: {
        query: true,
        rules: ['number', 'min=0']
    },
    sort: {
        query: true,
        rules: ['string', (value) => {
            if (!['desc', 'asc'].includes(value)) throw new Error('parameter "sort" should be "asc" or "desc"')
        }]
    }
}

const productModelDef = () => {
    const body = true
    const def = {
        title: {
            body,
            rules: []
        }
    }
}

export default class extends Karman {
    constructor(url) {
        super(url, 'products')
    }

    getAllProducts = this.$createAPI({
        payloadDef: limitAndSortDef
    })

    getProductById = this.$createAPI({
        payloadDef: {
            id: productIdDef(true)
        }
    })

    getAllCategories = this.$createAPI({
        endpoint: 'categories'
    })

    getProductByCategory = this.$createAPI({
        endpoint: 'category',
        payloadDef: {
            ...limitAndSortDef,
            category: {
                path: 1,
                rules: ['required', 'string']
            }
        }
    })
}