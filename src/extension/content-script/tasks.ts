import { AutomatedTabTask, GetContext, AutomatedTabTaskRuntimeOptions } from '@holoflows/kit'
import { ProfileIdentifier, ECKeyIdentifier, Identifier } from '../../database/type'
import {
    disableOpenNewTabInBackgroundSettings,
    currentImmersiveSetupStatus,
    ImmersiveSetupCrossContextStatus,
} from '../../components/shared-settings/settings'
import type { SocialNetworkUI } from '../../social-network/ui'
import { memoizePromise } from '../../utils/memoize'
import { safeGetActiveUI } from '../../utils/safeRequire'
import Serialization from '../../utils/type-transform/Serialization'
import { sideEffect } from '../../utils/side-effects'
import { untilDocumentReady } from '../../utils/dom'
import { sleep } from '../../utils/utils'

function getActivatedUI() {
    return safeGetActiveUI()
}

const _tasks = {
    getPostContent: () => getActivatedUI().taskGetPostContent(),
    /**
     * Access profile page
     * Get Profile
     */
    getProfile: (identifier: ProfileIdentifier) => getActivatedUI().taskGetProfile(identifier),
    /**
     * Access profile page
     * Paste text into bio
     */
    pasteIntoBio: async (text: string) => getActivatedUI().taskPasteIntoBio(text),
    /**
     * Access main page
     * Paste text into PostBox
     */
    pasteIntoPostBox: async (text: string, options: Parameters<SocialNetworkUI['taskPasteIntoPostBox']>[1]) =>
        getActivatedUI().taskPasteIntoPostBox(text, options),
    /**
     * Fetch a url in the current context
     */
    async fetch(...args: Parameters<typeof fetch>) {
        return fetch(...args).then((x) => x.text())
    },
    memoizeFetch: memoizePromise(
        (url) => {
            return fetch(url).then((x) => x.text())
        },
        (x) => x,
    ),
    async immersiveSetup(for_: ECKeyIdentifier) {
        getActivatedUI().taskStartImmersiveSetup(for_)
    },
}
const realTasks = AutomatedTabTask(_tasks, {
    memorable: true,
    AsyncCallOptions: { serializer: Serialization },
})!
console.log('To debug tasks, use globalThis.tasks, sleep fn is also available')
Object.assign(globalThis, { tasks: _tasks, sleep: sleep })
export default function tasks(...args: Parameters<typeof realTasks>) {
    const [tabIdOrUri, options] = args
    if (disableOpenNewTabInBackgroundSettings.value && Number.isNaN(Number(tabIdOrUri))) {
        if (!options || !options.active)
            throw new Error(
                `You have disabled "Disable fetching public keys in the background" in the settings so Maskbook can not perform this action`,
            )
    }
    // in the background
    if (realTasks) return realTasks(...args)
    // for debug purpose
    return _tasks
}

const uriCanDoTask = (tabUri?: string, targetUri?: any) => {
    if (tabUri?.startsWith(targetUri)) return true
    return false
}

/**
 * ! For mobile standalone app
 * This function will open/switch tabs (and start tasks)
 * It tries to check if a tab being able to do the target task already opened before opening it
 * For Chrome, `browser.tabs.query` won't work for chrome-extension: schema, so this function is not useful
 */

export function exclusiveTasks(...args: Parameters<typeof realTasks>) {
    const [uri, options = {}, ...others] = args
    const updatedOptions: Partial<AutomatedTabTaskRuntimeOptions> = {
        active: true,
        memorable: false,
        autoClose: false,
    }
    if (webpackEnv.genericTarget !== 'facebookApp') return tasks(uri, { ...updatedOptions, ...options }, ...others)
    let _key: keyof typeof _tasks
    let _args: any[]
    const promise = Promise.resolve(browser.tabs.query({})).then((tabs) => {
        const target = uri.toString().replace(/\/.+$/, '')
        const [tab] = tabs.filter((tab) => tab.url?.startsWith(target))
        if (tab) {
            Object.assign(updatedOptions, {
                runAtTabID: tab.id,
                needRedirect: !uriCanDoTask(tab.url, uri),
                url: uri,
            })
        }
        Object.assign(updatedOptions, options)
        const task = tasks(uri, updatedOptions, ...others)
        // @ts-ignore
        if (_key in task) return task[_key](..._args)
        return task
    })
    return new Proxy({} as typeof _tasks, {
        get(_, key: keyof typeof _tasks | 'then') {
            if (key === 'then') return undefined
            _key = key
            return (...args: any) => {
                _args = args
                return promise
            }
        },
    })
}

sideEffect.then(untilDocumentReady).then(() => {
    if (GetContext() !== 'content') return
    const network = getActivatedUI().networkIdentifier
    const id = currentImmersiveSetupStatus[network].value
    const onStatusUpdate = (id: string) => {
        const status: ImmersiveSetupCrossContextStatus = JSON.parse(id || '{}')
        if (status.persona && status.status === 'during') {
            _tasks.immersiveSetup(Identifier.fromString(status.persona, ECKeyIdentifier).unwrap())
        }
    }
    currentImmersiveSetupStatus[network].addListener(onStatusUpdate)
    currentImmersiveSetupStatus[network].readyPromise.then(onStatusUpdate)
    onStatusUpdate(id)
})
