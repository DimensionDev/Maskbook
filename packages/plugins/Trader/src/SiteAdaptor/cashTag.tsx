import { PluginTraderMessages } from '../messages.js'
import { TrendingAPI } from '@masknet/web3-providers/types'
import type { ChainId } from '@masknet/web3-shared-evm'
import type { Plugin } from '@masknet/plugin-infra'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { NetworkPluginID } from '@masknet/shared-base'

export const enhanceTag: Plugin.SiteAdaptor.Definition<ChainId>['enhanceTag'] = {
    onHover(kind, content, event, chainId: Web3Helper.Definition[NetworkPluginID.PLUGIN_EVM]['ChainId']) {
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
