import { Flags } from '../../../utils/flags'

type Args = browser.webNavigation.TransitionNavListener extends browser.webNavigation.NavListener<infer U> ? U : never
export default function () {
    const injectedScript = getInjectedScript()
    const contentScripts: Array<{ code: string } | { file: string }> = []
    const contentScriptReady = fetch('/generated__content__script.html')
        .then((x) => x.text())
        .then((html) => {
            const parser = new DOMParser()
            const root = parser.parseFromString(html, 'text/html')
            root.querySelectorAll('script').forEach((script) => {
                if (script.innerText) contentScripts.push({ code: script.innerText })
                else if (script.src)
                    contentScripts.push({ file: new URL(script.src, browser.runtime.getURL('')).pathname })
            })
        })
    async function onCommittedListener(arg: Args): Promise<void> {
        if (arg.url === 'about:blank') return
        if (!arg.url.startsWith('http')) return
        if (process.env.NODE_ENV === 'development') {
            if (arg.url.includes('localhost')) return
            if (arg.url.includes('127.0.0.1')) return
        }
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
                    code: process.env.NODE_ENV === 'development' ? await getInjectedScript() : await injectedScript,
                })
                .catch(IgnoreError(arg))
        }
        if (Flags.requires_injected_script_run_directly) {
            browser.tabs.executeScript(arg.tabId, {
                runAt: 'document_start',
                frameId: arg.frameId,
                file: 'js/injected-script.js',
            })
        }
        await contentScriptReady
        for (const script of contentScripts) {
            const option: browser.extensionTypes.InjectDetails = {
                runAt: 'document_idle',
                frameId: arg.frameId,
                ...script,
            }
            try {
                await browser.tabs.executeScript(arg.tabId, option)
            } catch (e) {
                IgnoreError(option)(e)
            }
        }
    }
    browser.webNavigation.onCommitted.addListener(onCommittedListener)
    return () => browser.webNavigation.onCommitted.removeListener(onCommittedListener)
}

async function getInjectedScript() {
    try {
        return `{
    const script = document.createElement('script')
    script.innerHTML = ${await fetch('js/injected-script.js')
        .then((x) => x.text())
        .then(JSON.stringify)}
    document.documentElement.appendChild(script)
}`
    } catch (e) {
        console.error(e)
        return `console.log('Injected script failed to load.')`
    }
}
function IgnoreError(arg: unknown): (reason: Error) => void {
    return (e) => {
        const ignoredErrorMessages = ['non-structured-clonable data', 'No tab with id']
        if (ignoredErrorMessages.some((x) => e.message.includes(x))) {
            // It's okay we don't need the result, happened on Firefox
        } else console.error('Inject error', e.message, arg, Object.entries(e))
    }
}
