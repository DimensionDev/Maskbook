import './polyfill'
import { GetContext } from '@holoflows/kit/es'
import { MessageCenter } from './utils/messages'
import 'webcrypto-liner'
import './_background_loader.1'
import './_background_loader.2'
import './extension/service'
import './provider.worker'
import './utils/hmr-client'
if (process.env.NODE_ENV === 'development') import('./network/matrix/instance')
if (process.env.NODE_ENV === 'development') import('./protocols/wallet-provider/metamask-provider')

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
import { exclusiveTasks } from './extension/content-script/tasks'
import { HasNoBrowserTabUI, HasNativeWelcomeProcess, SupportNativeInjectedScriptDeclaration } from './utils/constants'

if (GetContext() === 'background') {
    const injectedScript = getInjectedScript()
    const contentScripts: Promise<Array<{ code: string } | { file: string }>> = getContentScripts()

    browser.webNavigation.onCommitted.addListener(async (arg) => {
        if (arg.url === 'about:blank') return
        /**
         * For WKWebview, there is a special way to do it in the manifest.json
         *
         * A `iOS-injected-scripts` field is used to add extra scripts
         */
        if (!SupportNativeInjectedScriptDeclaration) {
            browser.tabs
                .executeScript(arg.tabId, {
                    runAt: 'document_start',
                    frameId: arg.frameId,
                    // refresh it every time in the dev mode so it's easier to debug injected script
                    code: process.env.NODE_ENV === 'development' ? await getInjectedScript() : await injectedScript,
                })
                .catch((x) => IgnoreError(x, arg))
        }
        // In Firefox
        browser.tabs.executeScript(arg.tabId, {
            runAt: 'document_start',
            frameId: arg.frameId,
            file: 'js/injected-script.js',
        })
        for (const script of await contentScripts) {
            const option: browser.extensionTypes.InjectDetails = {
                runAt: 'document_idle',
                frameId: arg.frameId,
                ...script,
            }
            try {
                await browser.tabs.executeScript(arg.tabId, option)
            } catch (e) {
                IgnoreError(e, option)
            }
        }
    })

    browser.runtime.onInstalled.addListener((detail) => {
        if (HasNativeWelcomeProcess) return
        if (detail.reason === 'install') {
            browser.tabs.create({ url: getWelcomePageURL() })
        }
    })

    MessageCenter.on('closeActiveTab', async () => {
        const tabs = await browser.tabs.query({
            active: true,
        })
        if (tabs[0]) {
            await browser.tabs.remove(tabs[0].id!)
        }
    })

    contentScripts.then(() => {
        if (HasNoBrowserTabUI) {
            exclusiveTasks('https://m.facebook.com/', { important: true })
        }
        // exclusiveTasks(getWelcomePageURL({}), { important: true })
    })
}
async function getContentScripts() {
    const contentScripts: Array<{ code: string } | { file: string }> = []
    const x = await fetch('content-script.html')
    const html = await x.text()
    const parser = new DOMParser()
    const root = parser.parseFromString(html, 'text/html')
    root.querySelectorAll('script').forEach((script) => {
        if (script.innerText) contentScripts.push({ code: script.innerText })
        else if (script.src) contentScripts.push({ file: new URL(script.src, browser.runtime.getURL('')).pathname })
    })
    return contentScripts
}
async function getInjectedScript() {
    return `{
        const script = document.createElement('script')
        script.innerHTML = ${await fetch('isolated/injected_script.js')
            .then((x) => x.text())
            .then(JSON.stringify)}
        document.documentElement.appendChild(script)
    }`
}
function IgnoreError(e: Error, ...args: any) {
    if (e.message.includes('non-structured-clonable data')) {
        // It's okay we don't need the result, happened on Firefox
    } else if (e.message.includes('Frame not found, or missing host permission')) {
        // It's maybe okay, happened on Firefox
    } else if (e.message.includes('must request permission')) {
        // It's okay, we inject to the wrong site and browser rejected it.
    } else if (e.message.includes('Cannot access a chrome')) {
        // It's okay, we inject to the wrong site and browser rejected it.
    } else console.error('Inject error:', e, e.message, ...args)
}

console.log('Build info', {
    NODE_ENV: process.env.NODE_ENV,
    VERSION: process.env.VERSION,
    TAG_NAME: process.env.TAG_NAME,
    COMMIT_HASH: process.env.COMMIT_HASH,
    COMMIT_DATE: process.env.COMMIT_DATE,
    BUILD_DATE: process.env.BUILD_DATE,
    REMOTE_URL: process.env.REMOTE_URL,
    BRANCH_NAME: process.env.BRANCH_NAME,
    DIRTY: process.env.DIRTY,
    TAG_DIRTY: process.env.TAG_DIRTY,
})

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
