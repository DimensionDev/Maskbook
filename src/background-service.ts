import { GetContext } from '@holoflows/kit/es'
import { MessageCenter } from './utils/messages'
import './_background_loader.0'
import 'webcrypto-liner'
import './_background_loader.1'
import './extension/service'
import './provider.worker'

import * as PersonaDB from './database/Persona/Persona.db'
import * as PersonaDBHelper from './database/Persona/helpers'
import { initAutoShareToFriends } from './extension/background-script/Jobs/AutoShareToFriends'

import { gun2 } from './network/gun/version.2'
import * as crypto40 from './crypto/crypto-alpha-40'
import * as crypto39 from './crypto/crypto-alpha-39'
import * as crypto38 from './crypto/crypto-alpha-38'
import * as avatar from './database/avatar'
import * as group from './database/group'
import * as type from './database/type'
import * as post from './database/post'
import { definedSocialNetworkWorkers } from './social-network/worker'
import { getWelcomePageURL } from './extension/options-page/Welcome/getWelcomePageURL'

if (GetContext() === 'background') {
    const injectedScript = `{
        const script = document.createElement('script')
        script.src = "${browser.runtime.getURL('js/injected-script.js')}"
        document.documentElement.appendChild(script)
    }`
    const contentScripts: Array<{ code: string } | { file: string }> = []
    const contentScriptReady = fetch('generated__content__script.html')
        .then(x => x.text())
        .then(html => {
            const parser = new DOMParser()
            const root = parser.parseFromString(html, 'text/html')
            root.querySelectorAll('script').forEach(script => {
                if (script.innerText) contentScripts.push({ code: script.innerText })
                else if (script.src)
                    contentScripts.push({ file: new URL(script.src, browser.runtime.getURL('')).pathname })
            })
        })
    browser.webNavigation.onCommitted.addListener(async arg => {
        if (arg.url === 'about:blank') return
        await contentScriptReady
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
                IgnoreError(e)
            }
        }
    })

    browser.runtime.onInstalled.addListener(detail => {
        if (webpackEnv.target === 'WKWebview') return
        if (detail.reason === 'install') {
            browser.tabs.create({ url: getWelcomePageURL() })
        }
    })

    if (webpackEnv.target === 'WKWebview') {
        contentScriptReady.then(() =>
            browser.tabs.create({
                url: 'https://m.facebook.com/',
                active: true,
            }),
        )
    }
    MessageCenter.on('closeActiveTab', async () => {
        const tabs = await browser.tabs.query({
            active: true,
        })
        if (tabs[0]) {
            await browser.tabs.remove(tabs[0].id!)
        }
    })
}
function IgnoreError(arg: unknown): (reason: Error) => void {
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

// Friendly to debug
Object.assign(window, {
    definedSocialNetworkWorkers,
    gun2: gun2,
    crypto40: crypto40,
    crypto39: crypto39,
    crypto38: crypto38,
    db: {
        avatar: avatar,
        group: group,
        persona: PersonaDB,
        personaHelper: PersonaDBHelper,
        type: type,
        post: post,
    },
})
initAutoShareToFriends()
