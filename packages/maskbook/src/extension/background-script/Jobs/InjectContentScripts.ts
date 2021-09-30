import { noop } from 'lodash-es'
import { MaskMessages } from '../../../utils'
import { Flags } from '../../../utils/flags'

type Args = browser.webNavigation.TransitionNavListener extends browser.webNavigation.NavListener<infer U> ? U : never
export default function (signal: AbortSignal) {
    const injectedScriptURL = '/injected-script.js'
    const injectedScript = fetchUserScript(injectedScriptURL)

    const maskSDK_URL = '/mask-sdk.js'
    const maskSDK = fetchUserScript(maskSDK_URL)

    const injectContentScript = fetchInjectContentScript('/generated__content__script.html')

    async function onCommittedListener(arg: Args): Promise<void> {
        if (arg.url === 'about:blank') return
        if (!arg.url.startsWith('http')) return
        const contains = await browser.permissions.contains({ origins: [arg.url] })
        if (!contains) return

        /**
         * A `manifest.webextension-shim.json` field is used to declare user scripts.
         */
        if (!Flags.support_declarative_user_script) {
            const detail: browser.extensionTypes.InjectDetails = { runAt: 'document_start', frameId: arg.frameId }

            //#region Injected script
            if (Flags.has_firefox_xray_vision) {
                browser.tabs.executeScript(arg.tabId, { ...detail, file: injectedScriptURL })
            } else {
                // Refresh the injected script every time in the development mode.
                const code =
                    process.env.NODE_ENV === 'development'
                        ? await fetchUserScript(injectedScriptURL)
                        : await injectedScript
                browser.tabs.executeScript(arg.tabId, { ...detail, code }).catch(HandleError(arg))
            }
            //#endregion

            //#region Mask SDK
            if (Flags.mask_SDK_ready) {
                const code = process.env.NODE_ENV === 'development' ? await fetchUserScript(maskSDK_URL) : await maskSDK
                browser.tabs.executeScript(arg.tabId, { ...detail, code }).catch(HandleError(arg))
            }
            //#endregion
        }
        injectContentScript(arg.tabId, arg.frameId).catch(HandleError(arg))
    }
    browser.webNavigation.onCommitted.addListener(onCommittedListener)
    signal.addEventListener('abort', () => browser.webNavigation.onCommitted.removeListener(onCommittedListener))

    if (process.env.NODE_ENV === 'development' && Flags.mask_SDK_ready) {
        signal.addEventListener(
            'abort',
            MaskMessages.events.maskSDKHotModuleReload.on(async () => {
                const code = (await fetchUserScript(maskSDK_URL)) + `\n;console.log("[@masknet/sdk] SDK reloaded.")`
                for (const tab of await browser.tabs.query({})) {
                    browser.tabs.executeScript(tab.id!, { code }).then(noop)
                }
            }),
        )
    }
}

function fetchInjectContentScript(entryHTML: string) {
    const contentScripts: Array<{ code: string } | { file: string }> = []
    const task = fetch(entryHTML)
        .then((x) => x.text())
        .then((html) => {
            const parser = new DOMParser()
            const root = parser.parseFromString(html, 'text/html')
            for (const script of root.querySelectorAll('script')) {
                if (script.innerText) contentScripts.push({ code: script.innerText })
                else if (script.src)
                    contentScripts.push({ file: new URL(script.src, browser.runtime.getURL('')).pathname })
            }
        })
    return async (tabID: number, frameId: number | undefined) => {
        await task
        for (const script of contentScripts) {
            const option: browser.extensionTypes.InjectDetails = {
                runAt: 'document_idle',
                frameId,
                ...script,
            }
            await browser.tabs.executeScript(tabID, option)
        }
    }
}
async function fetchUserScript(url: string) {
    try {
        return `{
    const script = document.createElement('script')
    script.innerHTML = ${await fetch(url)
        .then((x) => x.text())
        .then((x) => x.replace('process.env.NODE_ENV', JSON.stringify(process.env.NODE_ENV)))
        .then(JSON.stringify)}
    document.documentElement.appendChild(script)
}`
    } catch (error) {
        console.error(error)
        return `console.log('User script ${url} failed to load.')`
    }
}

function HandleError(arg: unknown): (reason: Error) => void {
    return (error) => {
        const ignoredErrorMessages = ['non-structured-clonable data', 'No tab with id']
        if (ignoredErrorMessages.some((x) => error.message.includes(x))) {
            // It's okay we don't need the result, happened on Firefox
        } else {
            console.error('Inject error', error.message, arg, ...Object.entries(error))
        }
    }
}
