import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { DevtoolsMessage } from '../shared.js'
import { createReactDevTools } from './react.js'

const registerOnStyleChange = (() => {
    let lastText = ''
    type StyleChangeListener = (newText: string) => void
    const styleChangeListeners = new Set<StyleChangeListener>()
    function registerOnStyleChange(callback: StyleChangeListener) {
        styleChangeListeners.add(callback)
        callback(lastText)
    }
    const watcher = new MutationObserver(() => {
        const cssText = Array.from(document.head.querySelectorAll('style'))
            .map((x) => x.textContent || '')
            .join('\n')
        if (cssText === lastText) return
        lastText = cssText
        for (const listener of styleChangeListeners) listener(cssText)
    })
    watcher.observe(document.head, { characterData: true, childList: true, subtree: true })
    return registerOnStyleChange
})()

let components: browser.devtools.panels.ExtensionPanel
let profiler: browser.devtools.panels.ExtensionPanel
let componentsWindow: Window
let profilerWindow: Window

async function onInit() {
    const abort = new AbortController()
    const signal = abort.signal
    const ReactDevTools = createReactDevTools()
    DevtoolsMessage.events.helloFromBackend.on(() => DevtoolsMessage.events.activateBackend.sendByBroadcast(), {
        signal,
        once: true,
    })
    DevtoolsMessage.events.activateBackend.sendByBroadcast()

    // If this is the first open, we wait for devtools message to show UI.
    if (!components) await new Promise((resolve) => DevtoolsMessage.events._.on(resolve, { once: true, signal }))
    components ??= await createPanel('\u269B\uFE0F Components')
    profiler ??= await createPanel('\u269B\uFE0F Profile')

    function Host() {
        const [componentRef, setComponentRef] = useState<HTMLElement | undefined>(getMountPoint(componentsWindow))
        const [profilerRef, setProfilerRef] = useState<HTMLElement | undefined>(getMountPoint(profilerWindow))
        useEffect(() => {
            const a = (window: Window) => {
                componentsWindow = window
                setComponentRef(getMountPoint(window))
            }
            const b = (window: Window) => {
                profilerWindow = window
                setProfilerRef(getMountPoint(window))
            }
            components.onShown.addListener(a)
            profiler.onShown.addListener(b)
            return () => {
                components.onShown.removeListener(a)
                profiler.onShown.removeListener(b)
            }
        }, [])
        useEffect(() => () => componentRef?.remove(), [componentRef])
        useEffect(() => () => profilerRef?.remove(), [profilerRef])
        return (
            <ReactDevTools
                browserTheme={(browser.devtools.panels as any).themeName === 'dark' ? 'dark' : 'light'}
                componentsPortalContainer={componentRef}
                profilerPortalContainer={profilerRef}
            />
        )
    }

    const container = document.createElement('main')
    const root = createRoot(container)
    document.body.appendChild(container)
    root.render(<Host />)

    function onRefresh() {
        flushSync(() => root.unmount())
        container.remove()
        browser.devtools.network.onNavigated.removeListener(onRefresh)
        abort.abort()
        onInit()
    }
    browser.devtools.network.onNavigated.addListener(onRefresh)
}
onInit()

function createPanel(name: string) {
    return browser.devtools.panels.create(name + ' (\u{1F3AD})', '128x128.png', 'empty.html')
}

function getMountPoint(window: Window | undefined) {
    if (!window) return undefined
    const dom = window.document.getElementById('container')
    if (dom) return dom

    const dom2 = window.document.createElement('main')
    dom2.id = 'container'
    dom2.style.height = '100vh'
    window.document.body.appendChild(dom2)
    window.document.body.style.margin = '0'

    const style = window.document.createElement('style')
    window.document.head.appendChild(style)
    registerOnStyleChange((newText) => (style.textContent = newText))

    return dom2
}
