import './extension/service'
import { backgroundSetup } from './setup'
import { GetContext } from '@holoflows/kit/es'
backgroundSetup()

if (GetContext() === 'background') {
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
                    frameId: arg.frameId,
                    code: script,
                })
            } catch (e) {
                if (e.message.match('non-structured-clonable data')) {
                    // It's okay we don't need the result, happened on Firefox
                } else if (e.message.match('Frame not found, or missing host permission')) {
                    // It's maybe okay, happened on Firefox
                } else console.error('Inject error', e, arg, browser.runtime.getURL('js/injectedscript.js'))
            }
        },
        { url: [{ hostEquals: 'www.facebook.com' }] },
    )
}
