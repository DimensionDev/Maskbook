import { PluginTraderMessages, PluginTraderRPC } from '../messages'
import { TagType } from '../types'
import type { Plugin } from '@masknet/plugin-infra'

export const enhanceTag: Plugin.SNSAdaptor.Definition['enhanceTag'] = {
    onHover(kind, content, event) {
        const element = event.currentTarget
        const timer = setTimeout(async () => {
            const type = kind === 'cash' ? TagType.CASH : TagType.HASH
            const dataProviders = await PluginTraderRPC.getAvailableDataProviders(type, content)
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
