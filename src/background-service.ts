import 'webcrypto-liner/dist/webcrypto-liner.shim.js'
import { backgroundSetup } from './setup'
import { GetContext } from '@holoflows/kit/es'
import { getWelcomePageURL } from './extension/options-page/Welcome/getWelcomePageURL'

backgroundSetup().then(() => {
    require('./extension/service')
})

if (GetContext() === 'background') {
    const injectedScript = `{
        const script = document.createElement('script')
        script.src = "${browser.runtime.getURL('js/injectedscript.js')}"
        document.documentElement.appendChild(script)
    }`
    const contentScripts: Array<{ code: string } | { file: string }> = []
    fetch('generated__content__script.html')
        .then(x => x.text())
        .then(html => {
            const parser = new DOMParser()
            const root = parser.parseFromString(html, 'text/html')
            Promise.all(
                Array.from(root.querySelectorAll('script')).map(script => {
                    if (script.innerText) return Promise.resolve(script.innerText)
                    else if (script.src) return fetch(script.src).then(x => x.text())
                    return ''
                }),
            ).then(code => code.forEach(x => contentScripts.push({ code: x })))
        })
    browser.webNavigation.onCommitted.addListener(async arg => {
        if (arg.url === 'about:blank') return
        browser.tabs
            .executeScript(arg.tabId, {
                runAt: 'document_start',
                frameId: arg.frameId,
                code: injectedScript,
            })
            .catch(IgnoreError(arg))
        for (const script of contentScripts) {
            const option: browser.extensionTypes.InjectDetails = {
                runAt: 'document_idle',
                frameId: arg.frameId,
                ...script,
            }
            try {
                await browser.tabs.executeScript(arg.tabId, option)
            } catch (e) {
                console.error('Inject failed', arg, option, e.message)
            }
        }
    })

    browser.runtime.onInstalled.addListener(detail => {
        if (detail.reason === 'install') {
            browser.tabs.create({ url: getWelcomePageURL() })
        }
    })
}
function IgnoreError(arg: any): (reason: any) => void {
    return e => {
        if (e.message.includes('non-structured-clonable data')) {
            // It's okay we don't need the result, happened on Firefox
        } else if (e.message.includes('Frame not found, or missing host permission')) {
            // It's maybe okay, happened on Firefox
        } else if (e.message.includes('must request permission')) {
            // It's okay, we inject to the wrong site and browser rejected it.
        } else if (e.message.includes('Cannot access a chrome')) {
            // It's okay, we inject to the wrong site and browser rejected it.
        } else console.error('Inject error', e, arg, Object.entries(e))
    }
}
