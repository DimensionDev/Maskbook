import './extension/service'
import { backgroundSetup } from './setup'
backgroundSetup()

browser.webNavigation.onCommitted.addListener(
    arg =>
        browser.tabs
            .executeScript(arg.tabId, {
                frameId: arg.frameId,
                runAt: 'document_start',
                file: browser.runtime.getURL('js/injectedscript.js'),
            })
            .then(console.log, console.log),
    { url: [{ hostSuffix: 'facebook.com' }] },
)
