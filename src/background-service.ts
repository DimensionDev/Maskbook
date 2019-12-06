import { GetContext } from '@holoflows/kit/es'
import { MessageCenter } from './utils/messages'
// @ts-ignore
import elliptic from 'elliptic'

Object.assign(window, { elliptic })
require('webcrypto-liner')
/**
 * Load service here. sorry for the ugly pattern.
 * But here's some strange problem with webpack.
 *
 * you should also add register in './extension/service.ts'
 */
import * as CryptoService from './extension/background-script/CryptoService'
import * as WelcomeService from './extension/background-script/WelcomeService'
import * as IdentityService from './extension/background-script/IdentityService'
import * as UserGroupService from './extension/background-script/UserGroupService'
import * as SteganographyService from './extension/background-script/SteganographyService'
import { decryptFromMessageWithProgress } from './extension/background-script/CryptoServices/decryptFrom'
import { initAutoShareToFriends } from './extension/background-script/Jobs/AutoShareToFriends'
Object.assign(window, {
    CryptoService,
    WelcomeService,
    SteganographyService,
    IdentityService,
    UserGroupService,
})
Object.assign(window, {
    ServicesWithProgress: {
        decryptFrom: decryptFromMessageWithProgress,
    },
})

require('./extension/service')
require('./provider.worker')

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
        const {
            getWelcomePageURL,
        } = require('./extension/options-page/Welcome/getWelcomePageURL') as typeof import('./extension/options-page/Welcome/getWelcomePageURL')
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
Object.assign(window, {
    definedSocialNetworkWorkers: (require('./social-network/worker') as typeof import('./social-network/worker'))
        .definedSocialNetworkWorkers,
})

// Run tests
require('./tests/1to1')
require('./tests/1toN')
require('./tests/sign-verify')
require('./tests/friendship-discover')
require('./tests/comment')

import * as PersonaDB from './database/Persona/Persona.db'
import * as PersonaDBHelper from './database/Persona/helpers'

// Friendly to debug
Object.assign(window, {
    gun1: require('./network/gun/version.1'),
    gun2: require('./network/gun/version.2'),
    crypto40: require('./crypto/crypto-alpha-40'),
    crypto39: require('./crypto/crypto-alpha-39'),
    crypto38: require('./crypto/crypto-alpha-38'),
    db: {
        avatar: require('./database/avatar'),
        group: require('./database/group'),
        deprecated_people: require('./database/migrate/_deprecated_people_db'),
        persona: PersonaDB,
        personaHelper: PersonaDBHelper,
        type: require('./database/type'),
        post: require('./database/post'),
    },
})
initAutoShareToFriends()
