import { getUrl } from '../../../utils/utils'
import type { ProfileIdentifier } from '../../../database/type'
import { DashboardRoute } from '../Route'

type Query = {
    identifier?: ProfileIdentifier
    avatar?: string
    nickname?: string
    plugin?: string
}
export function getWelcomePageURL(query?: Query) {
    if (query) {
        const { identifier, ...params } = query
        const param = new URLSearchParams(params as Record<string, string>)
        if (identifier) param.set('identifier', identifier.toText())
        return getUrl(`index.html#${DashboardRoute.Personas}/?${param.toString()}`)
    } else {
        return getUrl(`index.html#${DashboardRoute.Setup}`)
    }
}
