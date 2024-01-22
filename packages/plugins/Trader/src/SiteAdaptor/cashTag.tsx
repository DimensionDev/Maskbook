import type { Plugin } from '@masknet/plugin-infra'
import { checkIsMinimalMode } from '@masknet/plugin-infra/content-script'
import { PluginID } from '@masknet/shared-base'
import { TrendingAPI } from '@masknet/web3-providers/types'
import { PluginTraderMessages } from '../messages.js'

export const enhanceTag: Plugin.SiteAdaptor.Definition['enhanceTag'] = {
    onHover(kind, content, event) {
        const element = event.currentTarget
        const timer = setTimeout(async () => {
            const isMinimalMode = await checkIsMinimalMode(PluginID.Web3ProfileCard)
            if (isMinimalMode) return
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
