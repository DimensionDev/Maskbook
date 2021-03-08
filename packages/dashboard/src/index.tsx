/// <reference types="react/experimental" />
/// <reference types="react-dom/experimental" />
import './prepare'
import ReactDOM from 'react-dom'
import { setService, setPluginServices, PluginMessages, setMessages, setPluginMessages } from './API'
import { App } from './App'
import { AsyncCall } from 'async-call-rpc'
import { serializer } from '@dimensiondev/maskbook-shared'
import { StylesProvider } from '@material-ui/core/styles'
import { UnboundedRegistry, WebExtensionMessage, Environment } from '@dimensiondev/holoflows-kit'

if (import.meta.hot) {
    import.meta.hot.accept()
} else if (location.host === 'compassionate-northcutt-326a3a.netlify.app') {
    document.getElementById('warning')?.remove()
}
class WebExtensionExternalChannel extends WebExtensionMessage<any> {
    constructor(domain: string, id = 'jkoeaghipilijlahjplgbfiocjhldnap') {
        super({ externalExtensionID: id, domain })
    }
}
installService()
installPluginService()

ReactDOM.unstable_createRoot(document.getElementById('root')!).render(
    <StylesProvider injectFirst>
        <App />
    </StylesProvider>,
)

function installService() {
    // @ts-expect-error 2345
    setMessages(new WebExtensionExternalChannel('mask'))
    const servicesChannel = new WebExtensionExternalChannel('services')
    const service = initProxy((prop) => initRPCBridge(servicesChannel.events[String(prop)]))
    setService(service)
}

function installPluginService() {
    const channelOf = (id: string) => new WebExtensionExternalChannel('@plugin/' + id)
    const Wallet = channelOf('com.maskbook.wallet')
    // @ts-expect-error 2345
    setPluginMessages({ Wallet })
    setPluginServices({
        Wallet: initRPCBridge(PluginMessages.Wallet.events.rpc),
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
