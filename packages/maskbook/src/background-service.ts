import 'webpack-target-webextension/lib/background'
import './polyfill'
import { isEnvironment, Environment } from '@dimensiondev/holoflows-kit'
// @ts-ignore
import { crypto } from 'webcrypto-liner/build/index.es'
Object.defineProperty(globalThis, 'crypto', { configurable: true, enumerable: true, get: () => crypto })
import './extension/service'
import './provider.worker'

import * as PersonaDB from './database/Persona/Persona.db'
import * as PersonaDBHelper from './database/Persona/helpers'
import { initAutoShareToFriends } from './extension/background-script/Jobs/AutoShareToFriends'

import * as crypto40 from './crypto/crypto-alpha-40'
import * as crypto39 from './crypto/crypto-alpha-39'
import * as crypto38 from './crypto/crypto-alpha-38'
import * as avatar from './database/avatar'
import * as group from './database/group'
import * as type from './database/type'
import * as post from './database/post'
import { definedSocialNetworkWorkers } from './social-network/worker'
import { getWelcomePageURL } from './extension/options-page/Welcome/getWelcomePageURL'
import { Flags } from './utils/flags'
import './utils/native-rpc/index'

import('./plugins/PluginSerivce')

import tasks from './extension/content-script/tasks'
Object.assign(globalThis, { tasks })

if (process.env.NODE_ENV === 'development' && Flags.matrix_based_service_enabled) {
    import('./network/matrix/instance')
}

if (isEnvironment(Environment.ManifestBackground)) {
    const injectedScript = getInjectedScript()
    const contentScripts: Array<{ code: string } | { file: string }> = []
    const contentScriptReady = fetch('generated__content__script.html')
        .then((x) => x.text())
        .then((html) => {
            const parser = new DOMParser()
            const root = parser.parseFromString(html, 'text/html')
            root.querySelectorAll('script').forEach((script) => {
                if (script.innerText) contentScripts.push({ code: script.innerText })
                else if (script.src)
                    contentScripts.push({ file: new URL(script.src, browser.runtime.getURL('')).pathname })
            })
        })
    browser.webNavigation.onCommitted.addListener(async (arg) => {
        if (arg.url === 'about:blank') return
        if (!arg.url.startsWith('http')) return
        const contains = await browser.permissions.contains({ origins: [arg.url] })
        if (!contains) return
        /**
         * For iOS App, there is a special way to do it in the manifest.json
         * A `iOS-injected-scripts` field is used to add extra scripts
         */
        if (!Flags.support_native_injected_script_declaration && !Flags.requires_injected_script_run_directly) {
            browser.tabs
                .executeScript(arg.tabId, {
                    runAt: 'document_start',
                    frameId: arg.frameId,
                    // Refresh the injected script every time in the development mode.
                    code: process.env.NODE_ENV === 'development' ? await getInjectedScript() : await injectedScript,
                })
                .catch(IgnoreError(arg))
        }
        if (Flags.requires_injected_script_run_directly) {
            browser.tabs.executeScript(arg.tabId, {
                runAt: 'document_start',
                frameId: arg.frameId,
                file: 'js/injected-script.js',
            })
        }
        await contentScriptReady
        for (const script of contentScripts) {
            const option: browser.extensionTypes.InjectDetails = {
                runAt: 'document_idle',
                frameId: arg.frameId,
                ...script,
            }
            try {
                await browser.tabs.executeScript(arg.tabId, option)
            } catch (e) {
                IgnoreError(option)(e)
            }
        }
    })

    browser.runtime.onInstalled.addListener((detail) => {
        if (Flags.has_native_welcome_ui) return
        if (detail.reason === 'install') {
            browser.tabs.create({ url: getWelcomePageURL() })
        }
    })
}
async function getInjectedScript() {
    try {
        return `{
        const script = document.createElement('script')
        script.innerHTML = ${await fetch('js/injected-script.js')
            .then((x) => x.text())
            .then(JSON.stringify)}
        document.documentElement.appendChild(script)
    }`
    } catch (e) {
        console.error(e)
        return `console.log('Injected script failed to load.')`
    }
}
function IgnoreError(arg: unknown): (reason: Error) => void {
    return (e) => {
        const ignoredErrorMessages = ['non-structured-clonable data']
        if (ignoredErrorMessages.some((x) => e.message.includes(x))) {
            // It's okay we don't need the result, happened on Firefox
        } else console.error('Inject error', e.message, arg, Object.entries(e))
    }
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
