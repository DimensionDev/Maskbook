import { Flags } from '../../../utils/flags'

type Args = browser.webNavigation.TransitionNavListener extends browser.webNavigation.NavListener<infer U> ? U : never
export default function (signal: AbortSignal) {
    const injectedScript = fetchInjectedScript()
    const contentScripts = fetchInjectContentScript('/generated__content__script.html')
    async function onCommittedListener(arg: Args): Promise<void> {
        if (arg.url === 'about:blank') return
        if (!arg.url.startsWith('http')) return
        const contains = await browser.permissions.contains({ origins: [arg.url] })
        if (!contains) return
        /**
         * For iOS App, there is a special way to do it in the manifest.json
         * A `iOS-injected-scripts` field is used to add extra scripts
         */
        if (!Flags.support_native_injected_script_declaration && !Flags.requires_injected_script_run_directly) {
            browser.tabs
                .executeScript(arg.tabId, {
                    runAt: 'document_start',
                    frameId: arg.frameId,
                    // Refresh the injected script every time in the development mode.
                    code: process.env.NODE_ENV === 'development' ? await fetchInjectedScript() : await injectedScript,
                })
                .catch(HandleError(arg))
        }
        if (Flags.requires_injected_script_run_directly) {
            browser.tabs.executeScript(arg.tabId, {
                runAt: 'document_start',
                frameId: arg.frameId,
                file: '/injected-script.js',
            })
        }
        contentScripts(arg.tabId, arg.frameId).catch(HandleError(arg))
    }
    browser.webNavigation.onCommitted.addListener(onCommittedListener)
    signal.addEventListener('abort', () => browser.webNavigation.onCommitted.removeListener(onCommittedListener))
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
async function fetchInjectedScript() {
    try {
        return `{
    const script = document.createElement('script')
    script.innerHTML = ${await fetch('/injected-script.js')
        .then((x) => x.text())
        .then(JSON.stringify)}
    document.documentElement.appendChild(script)
}`
    } catch (error) {
        console.error(error)
        return `console.log('Injected script failed to load.')`
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
