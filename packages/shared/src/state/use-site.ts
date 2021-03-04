import { createStateHost, createStateClient } from './state'
import { WebExtensionMessage, Environment, MessageTarget } from '@dimensiondev/holoflows-kit'
const event = new WebExtensionMessage<{ state: any }>({ domain: 'state' })
// host, on background scripts
const { registerState } = createStateHost({
    async getPersistentedState(name: string) {
        // return browser.storage.local.get(...)
    },
    async setPersistentedState(name: string, val: unknown) {
        // return browser.storage.local.set(...)
    },
    channel: event.events.state.bind(MessageTarget.Broadcast),
})
registerState('debugMode', {
    defaultValue: false,
    type: 'global',
    persistent: true,
    i18n: {
        fallbackString: 'test',
        key: 'test',
    },
})

// client
const channelToBg = event.events.state.bind(Environment.ManifestBackground)
const {
    globalBindings: { debugMode },
    createNamespacedBinding,
} = createStateClient({ channel: channelToBg, defaultValues: { debugMode: false } })

debugMode.addListener(console.log)
debugMode.ready
debugMode.readyPromise.then(() => console.log(debugMode.value))
debugMode.version // for react
debugMode.value

const twitter = createNamespacedBinding('twitter.com')
twitter.currentImagePayloadStatus.addListener // same interface as debugMode
