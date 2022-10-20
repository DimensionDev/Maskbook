import { useEffect, useState } from 'react'
import type { TabID } from 'react-devtools-inline/commons.js'
import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { DevtoolsMessage, createReactDevToolsWall, GLOBAL_ID_KEY } from '../shared.js'
import { initialize, createBridge, DevtoolsProps, createStore } from 'react-devtools-inline/frontend'
import type { ComponentType } from 'react'
import { attachListener, createPanel, devtoolsEval } from './utils.js'

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

export async function startReactDevTools(signal: AbortSignal) {
    const runInContentScript = (await devtoolsEval<string>('location.href', false)).startsWith('http')
    const id = Math.random().toString(36)
    await devtoolsEval(`globalThis.${GLOBAL_ID_KEY} = ${JSON.stringify(id)}`, runInContentScript)
    const wall = createReactDevToolsWall(id)
    const bridge = createBridge(null!, wall)
    const store = createStore(bridge, {
        // @ts-expect-error
        isProfiling: false,
        supportsReloadAndProfile: false,
        supportsProfiling: true,
        supportsTimeline: true,
        supportsTraceUpdates: true,
        supportsNativeInspection: true,
    })

    // Note: since we manually passed bridge and wall, the first argument is unused in the implementation
    // Note: DT type is wrong
    // @ts-expect-error
    const ReactDevTools: ComponentType<Partial<DevtoolsProps>> = initialize(null!, { bridge, store })
    DevtoolsMessage.events.helloFromBackend.on(() => DevtoolsMessage.events.activateBackend.sendByBroadcast(id), {
        signal,
    })
    DevtoolsMessage.events.activateBackend.sendByBroadcast(id)

    // If this is the first open, we wait for devtools message to show UI.
    if (!components)
        await new Promise((resolve) => DevtoolsMessage.events[`_${id}`].on(resolve, { once: true, signal }))
    components ??= await createPanel('\u269B\uFE0F Components')
    profiler ??= await createPanel('\u269B\uFE0F Profile')

    let needsToSyncElementSelection = false

    function Host() {
        const [componentRef, setComponentRef] = useState<HTMLElement | undefined>(getMountPoint(componentsWindow))
        const [profilerRef, setProfilerRef] = useState<HTMLElement | undefined>(getMountPoint(profilerWindow))
        const [tab, setTab] = useState<TabID | undefined>(undefined)
        useEffect(() => {
            function onComponent(window: Window) {
                if (needsToSyncElementSelection) {
                    needsToSyncElementSelection = false
                    bridge.send('syncSelectionFromNativeElementsPanel')
                }
                componentsWindow = window
                setComponentRef(getMountPoint(window))
                setTab('components')
            }
            function onProfile(window: Window) {
                profilerWindow = window
                setProfilerRef(getMountPoint(window))
                setTab('profiler')
            }
            attachListener(components.onShown, onComponent, { signal })
            attachListener(profiler.onShown, onProfile, { signal })
        }, [])
        useEffect(() => () => componentRef?.remove(), [componentRef])
        useEffect(() => () => profilerRef?.remove(), [profilerRef])
        return (
            <ReactDevTools
                browserTheme={(browser.devtools.panels as any).themeName === 'dark' ? 'dark' : 'light'}
                componentsPortalContainer={componentRef}
                profilerPortalContainer={profilerRef}
                // Note: we're not providing this ability because without source map it is useless.
                //       and the default result (not minified) is good enough.
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

    // Mount the ReactDevTools
    {
        const container = document.createElement('main')
        const root = createRoot(container)
        document.body.appendChild(container)
        root.render(<Host />)
        signal.addEventListener(
            'abort',
            () => {
                flushSync(() => root.unmount())
                container.remove()
            },
            { once: true },
        )
    }

    // Send farewell message when closed
    window.addEventListener('beforeunload', () => DevtoolsMessage.events.farewell.sendByBroadcast(), { signal })

    // when click "inspect DOM"
    bridge.addListener('syncSelectionToNativeElementsPanel', () => {
        devtoolsEval<boolean>(
            `
            if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__.$0 !== $0) {
                inspect(__REACT_DEVTOOLS_GLOBAL_HOOK__.$0)
            }`,
            runInContentScript,
        )
    })

    // When select an element in DOM panel, track it in devtools.
    {
        attachListener((browser.devtools.panels as any).elements.onSelectionChanged, setReactSelectionFromBrowser, {
            signal,
        })
        async function setReactSelectionFromBrowser() {
            const didSelectionChange = await devtoolsEval<boolean>(
                `if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__?.$0 !== $0) {
                    window.__REACT_DEVTOOLS_GLOBAL_HOOK__.$0 = $0
                    true
                } else {
                    false
                }`,
                runInContentScript,
            )
            if (didSelectionChange) needsToSyncElementSelection = true
        }
    }

    function viewAttributeSourceFunction(id: number, path: Array<string | number>) {
        const rendererID = store.getRendererIDForElement(id)
        if (rendererID !== null) {
            bridge.send('viewAttributeSource', { id, path, rendererID })
            setTimeout(() => {
                devtoolsEval('window.$attribute && inspect($attribute)', runInContentScript)
            }, 100)
        }
    }

    function viewElementSourceFunction(id: number) {
        const rendererID = store.getRendererIDForElement(id)
        if (rendererID !== null) {
            bridge.send('viewElementSource', { id, rendererID })
            setTimeout(() => {
                devtoolsEval(
                    `if (window.$type !== null) {
                        if ($type && $type.prototype && $type.prototype.isReactComponent) {
                            // inspect Component.render, not constructor
                            inspect($type.prototype.render);
                        } else {
                            // inspect Functional Component
                            inspect($type);
                        }
                    }`,
                    runInContentScript,
                )
            }, 100)
        }
    }
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
