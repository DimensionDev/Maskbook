import { MessageCenter } from './utils/messages'
import { definedSocialNetworkUIs, activateSocialNetworkUI } from './social-network/ui'
import './provider.ui'
import { LiveSelector, Watcher, DOMProxy } from '@holoflows/kit/es'
import { exclusiveTasks } from './extension/content-script/tasks'

// Jesus.png
{
    const React = require('react')
    const ReactDOM = require('react-dom')
    const isUnstable = (x: string) => x.startsWith('unstable_')
    const stabilize = (x: string) => x.replace('unstable_', '')
    Object.keys(React)
        .filter(isUnstable)
        .forEach((x) => (React[stabilize(x)] = React[x]))
    Object.keys(ReactDOM)
        .filter(isUnstable)
        .forEach((x) => (ReactDOM[stabilize(x)] = ReactDOM[x]))
}

if (typeof window === 'object') {
    LiveSelector.enhanceDebugger()
    Watcher.enhanceDebugger()
    DOMProxy.enhanceDebugger()
}
Object.assign(globalThis, {
    definedSocialNetworkUIs: definedSocialNetworkUIs,
})
activateSocialNetworkUI()

const close = globalThis.close
globalThis.close = () => {
    if (webpackEnv.genericTarget === 'facebookApp') {
        exclusiveTasks('https://m.facebook.com/')
        return
    }
    Reflect.apply(close, window, [])
    setTimeout(async () => {
        if (typeof browser !== 'undefined' && browser.tabs && browser.tabs.query && browser.tabs.remove) {
            const { id } = await browser.tabs.getCurrent()
            id && (await browser.tabs.remove(id))
        } else {
            MessageCenter.emit('closeActiveTab', undefined)
        }
    }, 400)
}
