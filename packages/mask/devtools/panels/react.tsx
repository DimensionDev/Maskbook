import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import type { ProfilingDataFrontend, Store, TabID } from 'react-devtools-inline/commons.js'
import { createRoot } from 'react-dom/client'
import { DevtoolsMessage, createReactDevToolsWall, GLOBAL_ID_KEY } from '../shared.js'
import { initialize, createBridge, type DevtoolsProps, createStore } from 'react-devtools-inline/frontend.js'
import type { ComponentType } from 'react'
import { attachListener, createPanel, devtoolsEval } from './utils.js'
import type { DevtoolsPanels } from 'webextension-polyfill/namespaces/devtools_panels.js'
import { env } from '@masknet/flags'

const registerOnStyleChange = (() => {
    let lastText = ''
    type StyleChangeListener = (newText: string) => void
    const StyleChange = new EventTarget()
    function registerOnStyleChange(callback: StyleChangeListener, signal: AbortSignal) {
        StyleChange.addEventListener('style', () => callback(lastText), { signal })
        callback(lastText)
    }
    function updateStyle() {
        const cssText = Array.from(document.head.querySelectorAll('style'))
            .map((style) => style.textContent || '')
            .join('\n')
        if (cssText === lastText) return
        lastText = cssText
        StyleChange.dispatchEvent(new Event('style'))
    }
    updateStyle()
    const watcher = new MutationObserver(updateStyle)
    watcher.observe(document.head, { characterData: true, childList: true, subtree: true })
    return registerOnStyleChange
})()

let components: DevtoolsPanels.ExtensionPanel
let profiler: DevtoolsPanels.ExtensionPanel
let componentsWindow: Window
let profilerWindow: Window
let store: Store
let profilingData: ProfilingDataFrontend | null
let uninstallLast: () => void

function syncSavedPreferences(runInContentScript: boolean) {
    const obj = {
        __REACT_DEVTOOLS_APPEND_COMPONENT_STACK__: !!getLocalStorage('React::DevTools::appendComponentStack', true),
        __REACT_DEVTOOLS_BREAK_ON_CONSOLE_ERRORS__: !!getLocalStorage('React::DevTools::breakOnConsoleErrors', false),
        __REACT_DEVTOOLS_COMPONENT_FILTERS__: getLocalStorage('React::DevTools::componentFilters', {
            type: 1,
            value: 7,
            isEnabled: true,
        }),
        __REACT_DEVTOOLS_SHOW_INLINE_WARNINGS_AND_ERRORS__: !!getLocalStorage(
            'React::DevTools::showInlineWarningsAndErrors',
            true,
        ),
        __REACT_DEVTOOLS_HIDE_CONSOLE_LOGS_IN_STRICT_MODE__: !!getLocalStorage(
            'React::DevTools::hideConsoleLogsInStrictMode',
            false,
        ),
        __REACT_DEVTOOLS_BROWSER_THEME__: browser.devtools.panels.themeName === 'dark' ? 'dark' : 'light',
    }
    const data = JSON.stringify(obj)
    devtoolsEval(runInContentScript)`
        Object.assign(window, ${data});
        undefined;
    `
}

export async function startReactDevTools(signal: AbortSignal) {
    const runInContentScript = (await devtoolsEval(false)<string>`location.href`).startsWith('http')
    const __eval = devtoolsEval(runInContentScript)

    const id = String(browser.devtools.inspectedWindow.tabId)
    await __eval`
        globalThis.${GLOBAL_ID_KEY} = ${JSON.stringify(id)}
    `
    setEditorPreference()
    syncSavedPreferences(runInContentScript)

    // TODO: registerDevToolsEventLogger?

    const wall = createReactDevToolsWall(id, signal)
    const bridge = createBridge(null!, wall)
    bridge.addListener('reloadAppForProfiling', () => {
        setLocalStorage('React::DevTools::supportsProfiling', 'true')
        __eval`
            sessionStorage.setItem('React::DevTools::reloadAndProfile', 'true')
            sessionStorage.setItem('React::DevTools::recordChangeDescriptions', 'true')
            window.location.reload();
        `
    })
    bridge.addListener('syncSelectionToNativeElementsPanel', () => {
        __eval`
            if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__?.$0 !== $0) {
                inspect(__REACT_DEVTOOLS_GLOBAL_HOOK__.$0)
            }
        `
    })

    let isProfiling = false
    // reload and profile
    {
        const LOCAL_STORAGE_SUPPORTS_PROFILING_KEY = 'React::DevTools::supportsProfiling'
        if (getLocalStorage(LOCAL_STORAGE_SUPPORTS_PROFILING_KEY, false)) {
            isProfiling = true
            if (store) profilingData = store.profilerStore.profilingData
            removeLocalStorage(LOCAL_STORAGE_SUPPORTS_PROFILING_KEY)
        }
    }

    bridge.addListener('extensionBackendInitialized', () => {
        bridge.send('setTraceUpdatesEnabled', !!getLocalStorage('React::DevTools::traceUpdatesEnabled', false))
    })

    const isChromium = navigator.userAgent.includes('Chrome') || navigator.userAgent.includes('Chromium')

    store = createStore(bridge, {
        isProfiling,
        supportsReloadAndProfile: isChromium,
        supportsProfiling: true,
        supportsTimeline: isChromium,
        supportsTraceUpdates: true,
        // Note: new options
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        supportsInspectMatchingDOMElement: true,
        supportsClickToInspect: true,
    })
    if (!isProfiling && profilingData!) store.profilerStore.profilingData = profilingData

    function viewAttributeSourceFunction(id: number, path: Array<string | number>) {
        const rendererID = store.getRendererIDForElement(id)
        if (rendererID !== null) {
            bridge.send('viewAttributeSource', { id, path, rendererID })
            setTimeout(() => {
                __eval`
                    window.$attribute && inspect($attribute)
                `
            }, 100)
        }
    }
    // eslint-disable-next-line unicorn/consistent-function-scoping
    function viewElementSourceFunction(source: any, symbolicalSource: any) {
        const { sourceURL, line, column } = symbolicalSource ? symbolicalSource : source

        ;(browser.devtools.panels as any).openResource(sourceURL, line - 1, column - 1)
    }

    // Note: since we manually passed bridge and wall, the first argument is unused in the implementation
    const ReactDevTools: ComponentType<Partial<DevtoolsProps>> = initialize(null!, { bridge, store })
    DevtoolsMessage.helloFromBackend.on(() => DevtoolsMessage.activateBackend.sendByBroadcast(id), {
        signal,
    })
    DevtoolsMessage.activateBackend.sendByBroadcast(id)

    // If this is the first open, we wait for devtools message to show UI.
    if (!components && runInContentScript) {
        if (!(await devtoolsEval(true)`globalThis[Symbol.for('mask_init_patch')]`)) {
            await new Promise((resolve) => {
                DevtoolsMessage[`_${id}`].on(resolve, { once: true, signal })
            })
        }
    }
    components ??= await createPanel('\u{1F332} Components')
    profiler ??= await createPanel('\u26A1 Profile')

    let needsToSyncElementSelection = false

    function Host() {
        const [componentRef, setComponentRef] = useState<HTMLElement | undefined>(() =>
            getMountPoint(componentsWindow, signal),
        )
        const [profilerRef, setProfilerRef] = useState<HTMLElement | undefined>(() =>
            getMountPoint(profilerWindow, signal),
        )
        const [tab, setTab] = useState<TabID | undefined>(undefined)
        useEffect(() => {
            function onComponent(window: Window) {
                if (needsToSyncElementSelection) {
                    needsToSyncElementSelection = false
                    bridge.send('syncSelectionFromNativeElementsPanel')
                }
                componentsWindow = window
                setComponentRef(getMountPoint(window, signal))
                setTab('components')
            }
            function onProfile(window: Window) {
                profilerWindow = window
                setProfilerRef(getMountPoint(window, signal))
                setTab('profiler')
            }
            attachListener(components.onShown, onComponent, { signal })
            attachListener(profiler.onShown, onProfile, { signal })
        }, [])
        useEffect(() => () => componentRef?.remove(), [componentRef])
        useEffect(() => () => profilerRef?.remove(), [profilerRef])
        return (
            <ReactDevTools
                browserTheme={browser.devtools.panels.themeName === 'dark' ? 'dark' : 'light'}
                componentsPortalContainer={componentRef}
                profilerPortalContainer={profilerRef}
                hookNamesModuleLoaderFunction={() => import('react-devtools-inline/hookNames' as any)}
                showTabBar={false}
                // Note: since this function is used to fetch the JS file and parse it,
                // we don't need to care about the network cost because it's all local.
                // Note: it seems it is fetching mock source URL (webpack-internal://) which makes it useless.
                fetchFileWithCaching={(url) => fetch(url).then((x) => x.text())}
                enabledInspectedElementContextMenu
                viewAttributeSourceFunction={viewAttributeSourceFunction}
                canViewElementSourceFunction={() => isChromium}
                viewElementSourceFunction={viewElementSourceFunction}
                overrideTab={tab}
            />
        )
    }

    // Mount the ReactDevTools
    {
        const container = document.createElement('main')

        const root = createRoot(container)
        document.body.appendChild(container)
        uninstallLast?.()
        componentsWindow && removeDisabled(componentsWindow)
        profilerWindow && removeDisabled(profilerWindow)
        root.render(<Host />)
        signal.addEventListener(
            'abort',

            () => {
                componentsWindow && showDisabled(componentsWindow)
                profilerWindow && showDisabled(profilerWindow)
                uninstallLast = () => {
                    flushSync(() => root.unmount())
                    container.remove()
                }
            },
            { once: true },
        )
        function removeDisabled(window: Window) {
            const container = getMountPoint(window, signal)!
            container.style.opacity = 'unset'
            container.style.pointerEvents = 'unset'
            window.document.querySelector('#refresh')?.remove()
        }
        function showDisabled(window: Window) {
            const container = getMountPoint(window, signal)!
            container.style.opacity = '0.8'
            container.style.pointerEvents = 'none'
            const refresh = window.document.createElement('div')
            refresh.textContent = 'Waiting for the page to reload...'
            refresh.id = 'refresh'
            Object.assign(refresh.style, {
                background: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                padding: '24px',
                display: 'inline-block',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
            })
            window.document.body.appendChild(refresh)
        }
    }

    // When select an element in DOM panel, track it in devtools.
    {
        async function setReactSelectionFromBrowser() {
            const didSelectionChange = await __eval<boolean>`
                if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__ && window.__REACT_DEVTOOLS_GLOBAL_HOOK__.$0 !== $0) {
                    window.__REACT_DEVTOOLS_GLOBAL_HOOK__.$0 = $0
                    true
                } else {
                    false
                }
            `

            if (didSelectionChange) needsToSyncElementSelection = true
        }
        attachListener(browser.devtools.panels.elements.onSelectionChanged, setReactSelectionFromBrowser, { signal })
        setReactSelectionFromBrowser()
    }

    window.addEventListener('beforeunload', () => DevtoolsMessage.farewell.sendByBroadcast(), { signal })
}

function getMountPoint(window: Window, signal: AbortSignal): HTMLElement
function getMountPoint(window: Window | undefined, signal: AbortSignal): HTMLElement | undefined
function getMountPoint(window: Window | undefined, signal: AbortSignal) {
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
    registerOnStyleChange((newText) => (style.textContent = newText), signal)

    return dom2
}
function setEditorPreference() {
    const preset = env.REACT_DEVTOOLS_EDITOR_URL || 'vscode://file/{path}:{line}'
    const editorURL = 'React::DevTools::openInEditorUrl'
    if (!getLocalStorage(editorURL)) {
        setLocalStorage(editorURL, JSON.stringify(preset))
    }
}
function getLocalStorage<T = string>(key: string, defaultValue?: T | undefined): T | undefined {
    try {
        // eslint-disable-next-line no-restricted-globals
        const item = localStorage.getItem(key)
        if (item === null) return defaultValue
        return JSON.parse(item)
    } catch {
        return defaultValue
    }
}
function setLocalStorage(key: string, value: string) {
    try {
        // eslint-disable-next-line no-restricted-globals
        localStorage.setItem(key, value)
    } catch {}
}
function removeLocalStorage(key: string) {
    try {
        // eslint-disable-next-line no-restricted-globals
        localStorage.removeItem(key)
    } catch {}
}
