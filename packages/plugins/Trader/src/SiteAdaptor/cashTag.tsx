import { PluginTraderMessages } from '../messages.js'
import { TrendingAPI } from '@masknet/web3-providers/types'
import type { Plugin } from '@masknet/plugin-infra'

export const enhanceTag: Plugin.SiteAdaptor.Definition['enhanceTag'] = {
    onHover(kind, content, event) {
        const element = event.currentTarget
        const timer = setTimeout(async () => {
            const type = kind === 'cash' ? TrendingAPI.TagType.CASH : TrendingAPI.TagType.HASH

            PluginTraderMessages.trendingAnchorObserved.sendToLocal({
                name: content,
                type,
                anchorBounding: element.getBoundingClientRect(),
                anchorEl: element,
            })
        }, 500)
        return () => {
            clearTimeout(timer)
        }
    },
}
