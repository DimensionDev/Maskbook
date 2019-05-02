import './extension/service'
import { backgroundSetup } from './setup'
backgroundSetup()

browser.webNavigation.onCommitted.addListener(
    async arg => {
        try {
            await browser.tabs.executeScript(arg.tabId, {
                frameId: arg.frameId,
                runAt: 'document_start',
                file: 'js/injectedscript.js',
            })
        } catch (e) {
            console.error('Inject error', e, arg, browser.runtime.getURL('js/injectedscript.js'))
        }
    },
    { url: [{ hostEquals: 'www.facebook.com' }] },
)
