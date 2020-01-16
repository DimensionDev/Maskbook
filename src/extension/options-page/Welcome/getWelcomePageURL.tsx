import { getUrl } from '../../../utils/utils'
import { Query } from './index'
export function getWelcomePageURL(query?: Query) {
    if (query) {
        const { identifier, ...params } = query
        const param = new URLSearchParams(params as Record<string, string>)
        if (identifier) param.set('identifier', identifier.toText())
        return getUrl(`index.html#/home/?${param.toString()}`)
    } else {
        return getUrl(`index.html#/initialize/`)
    }
}
