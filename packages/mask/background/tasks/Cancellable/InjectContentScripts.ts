import { noop } from 'lodash-unified'
import { MaskMessages } from '../../../shared/messages'
import { Flags } from '../../../shared/flags'

type Args = browser.webNavigation.TransitionNavListener extends browser.webNavigation.NavListener<infer U> ? U : never

export const injectedScriptURL = '/injected-script.js'
export const maskSDK_URL = '/mask-sdk.js'
export const contentScriptURL = '/generated__content__script.html'

export default function (signal: AbortSignal) {
    const injectedScript = fetchUserScript(injectedScriptURL)
    const maskSDK = fetchUserScript(maskSDK_URL)
    const injectContentScript = fetchInjectContentScript(contentScriptURL)

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

            // #region Injected script
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
            // #endregion

            // #region Mask SDK
            if (Flags.mask_SDK_ready) {
                const code = process.env.NODE_ENV === 'development' ? await fetchUserScript(maskSDK_URL) : await maskSDK
                browser.tabs.executeScript(arg.tabId, { ...detail, code }).catch(HandleError(arg))
            }
            // #endregion
        }
        injectContentScript(arg.tabId, arg.frameId).catch(HandleError(arg))
    }
    browser.webNavigation.onCommitted.addListener(onCommittedListener)
    signal.addEventListener('abort', () => browser.webNavigation.onCommitted.removeListener(onCommittedListener))

    if (process.env.NODE_ENV === 'development' && Flags.mask_SDK_ready) {
        signal.addEventListener(
            'abort',
            MaskMessages.events.maskSDKHotModuleReload.on(async () => {
                const code = (await fetchUserScript(maskSDK_URL)) + '\n;console.log("[@masknet/sdk] SDK reloaded.")'
                for (const tab of await browser.tabs.query({})) {
                    browser.tabs.executeScript(tab.id!, { code }).then(noop)
                }
            }),
        )
    }
}
export async function fetchInjectContentScriptList(entryHTML: string) {
    const contentScripts: string[] = []
    const html = await fetch(entryHTML).then((x) => x.text())
    // We're not going to use DOMParser because it is not available in MV3.
    Array.from(html.matchAll(/<script src="([\w./-]+)"><\/script>/g)).forEach((script) =>
        contentScripts.push(new URL(script[1], browser.runtime.getURL('')).pathname),
    )

    const body = html.match(/<body>(.+)<\/body>/)![1]
    body.replace(/<script defer src="/g, '')
        .replace(/><\/script>/g, '')
        .split('"')
        .forEach((script) => {
            if (!script) return
            contentScripts.push(new URL(script, browser.runtime.getURL('')).pathname)
        })
    return contentScripts
}
function fetchInjectContentScript(entryHTML: string) {
    const contentScripts = fetchInjectContentScriptList(entryHTML)
    return async (tabID: number, frameId: number | undefined) => {
        for (const script of await contentScripts) {
            const option: browser.extensionTypes.InjectDetails = {
                runAt: 'document_idle',
                frameId,
                file: script,
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
