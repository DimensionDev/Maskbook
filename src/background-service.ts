import './extension/service'
import { backgroundSetup } from './setup'
backgroundSetup()

const script = `{
const script = document.createElement('script')
script.src = "${browser.runtime.getURL('js/injectedscript.js')}"
document.documentElement.appendChild(script)
}`
browser.webNavigation.onCommitted.addListener(
    async arg => {
        try {
            await browser.tabs.executeScript(arg.tabId, {
                runAt: 'document_start',
                code: script,
            })
        } catch (e) {
            console.error('Inject error', e, arg, browser.runtime.getURL('js/injectedscript.js'))
        }
    },
    { url: [{ hostEquals: 'www.facebook.com' }] },
)
