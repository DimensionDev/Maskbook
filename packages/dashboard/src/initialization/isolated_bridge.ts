import { Environment, UnboundedRegistry, WebExtensionMessage } from '@dimensiondev/holoflows-kit'
import { AsyncCall } from 'async-call-rpc'
import { serializer } from '@masknet/shared'
import { PluginMessages, setMessages, setPluginMessages, setPluginServices, setService } from '../API'

class WebExtensionExternalChannel extends WebExtensionMessage<any> {
    /* spell-checker: disable-next-line */
    constructor(domain: string, id = 'jkoeaghipilijlahjplgbfiocjhldnap') {
        super({ externalExtensionID: id, domain })
    }
}
installService()
installPluginService()

function installService() {
    setMessages(new WebExtensionExternalChannel('mask'))
    const servicesChannel = new WebExtensionExternalChannel('services')
    const service = initProxy((prop) => initRPCBridge(servicesChannel.events[String(prop)]))
    setService(service)
}

function installPluginService() {
    const channelOf = (id: string) => new WebExtensionExternalChannel('@plugin/' + id)
    const Wallet = channelOf('com.maskbook.wallet')
    const Transak = channelOf('com.maskbook.transak')
    const Swap = channelOf('com.maskbook.trader')
    const Pets = channelOf('com.maskbook.pets')
    setPluginMessages({ Wallet, Transak, Swap, Pets })
    setPluginServices({
        Wallet: initRPCBridge(PluginMessages.Wallet.events.rpc),
        Swap: initRPCBridge(PluginMessages.Swap.rpc),
    })
}

function initRPCBridge(channel: UnboundedRegistry<any>): any {
    return AsyncCall(
        {},
        {
            channel: channel.bind(Environment.ManifestBackground),
            serializer,
            log: 'all',
            thenable: false,
        },
    )
}

function initProxy(init: (key: string) => any) {
    return new Proxy({} as any, {
        get(target, prop) {
            if (typeof prop !== 'string') throw new TypeError()
            if (target[prop]) return target[prop]
            target[prop] = init(prop)
            return target[prop]
        },
    })
}
