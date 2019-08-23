import 'webcrypto-liner/dist/webcrypto-liner.shim.js'
// @ts-ignore
import browser_ from 'webextension-polyfill'
import { backgroundSetup } from './setup'
import { GetContext } from '@holoflows/kit/es'
import { getWelcomePageURL } from './extension/options-page/Welcome/getWelcomePageURL'
Object.assign(window, { browser: browser_ })

backgroundSetup().then(() => {
    require('./extension/service')
})

if (GetContext() === 'background') {
    const contentScript = `{
        const script = document.createElement('script')
        script.src = "${browser.runtime.getURL('js/injectedscript.js')}"
        document.documentElement.appendChild(script)
    }`
    browser.webNavigation.onCommitted.addListener(async arg => {
        browser.tabs
            .executeScript(arg.tabId, {
                runAt: 'document_start',
                frameId: arg.frameId,
                code: contentScript,
            })
            .catch(IgnoreError(arg))
        await browser.tabs
            .executeScript(arg.tabId, {
                runAt: 'document_idle',
                frameId: arg.frameId,
                file: 'polyfill/browser-polyfill.min.js',
            })
            .catch(IgnoreError(arg))
        await browser.tabs
            .executeScript(arg.tabId, {
                runAt: 'document_idle',
                frameId: arg.frameId,
                file: 'js/contentscript.js',
            })
            .catch(IgnoreError(arg))
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
        } else console.error('Inject error', e, arg)
    }
}
