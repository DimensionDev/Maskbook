import { getUrl } from '../../../utils/utils'
import { Query } from './index'
export function getWelcomePageURL(query?: Query) {
    if (query) {
        const param = new URLSearchParams()
        param.set('nickname', query.nickname || '')
        param.set('avatar', query.avatar || '')
        param.set('identifier', query.identifier.toText())
        return getUrl(`index.html#/home?${param.toString()}`)
    } else {
        return getUrl(`index.html#/initialize`)
    }
}
