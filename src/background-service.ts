import './extension/service'
import { backgroundSetup } from './setup'
import { GetContext } from '@holoflows/kit/es'
import { definedSocialNetworkWorkers } from './social-network/worker'
backgroundSetup()

if (GetContext() === 'background') {
    for (const worker of definedSocialNetworkWorkers) {
        if (!worker.injectedScript) continue
        const { code, url } = worker.injectedScript
        browser.webNavigation.onCommitted.addListener(
            async arg => {
                try {
                    await browser.tabs.executeScript(arg.tabId, {
                        runAt: 'document_start',
                        frameId: arg.frameId,
                        code,
                    })
                } catch (e) {
                    if (e.message.match('non-structured-clonable data')) {
                        // It's okay we don't need the result, happened on Firefox
                    } else if (e.message.match('Frame not found, or missing host permission')) {
                        // It's maybe okay, happened on Firefox
                    } else console.error('Inject error', e, arg, browser.runtime.getURL('js/injectedscript.js'))
                }
            },
            { url },
        )
    }
}
