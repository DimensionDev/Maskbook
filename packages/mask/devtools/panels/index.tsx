import { useEffect, useState } from 'react'
import type { TabID } from 'react-devtools-inline/commons.js'
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
    const { ReactDevTools, store, bridge } = createReactDevTools()
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
        const [tab, setTab] = useState<TabID | undefined>(undefined)
        useEffect(() => {
            const a = (window: Window) => {
                componentsWindow = window
                setComponentRef(getMountPoint(window))
                setTab('components')
            }
            const b = (window: Window) => {
                profilerWindow = window
                setProfilerRef(getMountPoint(window))
                setTab('profiler')
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
                // Note: we're not providing this ability because without source map it is useless.
                //       and the default result (unminified) is good enough.
                // hookNamesModuleLoaderFunction={() => import('react-devtools-inline/hookNames' as any)}
                showTabBar={false}
                // Note: since this function is used to fetch the JS file and parse it,
                // we don't need to care about the network cost because it's all local.
                // Note: it seems it is fetching mock source URL (webpack-internal://) which makes it useless.
                fetchFileWithCaching={(url) => fetch(url).then((x) => x.text())}
                enabledInspectedElementContextMenu
                viewAttributeSourceFunction={viewAttributeSourceFunction}
                viewElementSourceFunction={viewElementSourceFunction}
                overrideTab={tab}
                // @ts-expect-error Following props are not in the DT types
                viewUrlSourceFunction={
                    'openResource' in browser.devtools.panels
                        ? (url: string, line: number, col: number) =>
                              (browser.devtools.panels as any).openResource(url, line, col)
                        : undefined
                }
            />
        )
    }

    function viewAttributeSourceFunction(id: number, path: Array<string | number>) {
        const rendererID = store.getRendererIDForElement(id)
        if (rendererID !== null) {
            bridge.send('viewAttributeSource', { id, path, rendererID })
            setTimeout(() => {
                browser.devtools.inspectedWindow.eval(
                    'window.$attribute && inspect($attribute)',
                    // @ts-expect-error
                    { useContentScriptContext: true },
                )
            }, 100)
        }
    }

    function viewElementSourceFunction(id: number) {
        const rendererID = store.getRendererIDForElement(id)
        if (rendererID !== null) {
            bridge.send('viewElementSource', { id, rendererID })
            setTimeout(() => {
                browser.devtools.inspectedWindow.eval(
                    `
                    if (window.$type !== null) {
                        if ($type && $type.prototype && $type.prototype.isReactComponent) {
                            // inspect Component.render, not constructor
                            inspect($type.prototype.render);
                        } else {
                            // inspect Functional Component
                            inspect($type);
                        }
                    }
                `,
                    // @ts-expect-error
                    { useContentScriptContext: true },
                )
            }, 100)
        }
    }

    const container = document.createElement('main')
    const root = createRoot(container)
    document.body.appendChild(container)
    root.render(<Host />)

    window.addEventListener('beforeunload', () => DevtoolsMessage.events.farewell.sendByBroadcast(), {
        once: true,
        signal,
    })

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
