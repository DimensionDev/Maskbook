import { PluginTraderMessages, PluginTraderRPC } from '../messages'
import { TagType } from '../types'
import type { ChainId } from '@masknet/web3-shared-evm'
import type { Plugin } from '@masknet/plugin-infra'
import type { Web3Helper } from '@masknet/plugin-infra/web3'
import type { NetworkPluginID } from '@masknet/web3-shared-base'

export const enhanceTag: Plugin.SNSAdaptor.Definition<ChainId>['enhanceTag'] = {
    onHover(kind, content, event, chainId: Web3Helper.Definition[NetworkPluginID.PLUGIN_EVM]['ChainId']) {
        const element = event.currentTarget
        const timer = setTimeout(async () => {
            const type = kind === 'cash' ? TagType.CASH : TagType.HASH
            const dataProviders = await PluginTraderRPC.getAvailableDataProviders(chainId, type, content)
            if (!dataProviders.length) return
            PluginTraderMessages.cashTagObserved.sendToLocal({
                name: content,
                type,
                element,
                dataProviders,
            })
        }, 500)
        return () => {
            clearTimeout(timer)
        }
    },
}
