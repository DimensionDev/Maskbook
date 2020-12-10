import {
    AutomatedTabTask,
    isEnvironment,
    AutomatedTabTaskRuntimeOptions,
    Environment,
} from '@dimensiondev/holoflows-kit'
import { ProfileIdentifier, ECKeyIdentifier, Identifier } from '../../database/type'
import { disableOpenNewTabInBackgroundSettings, currentSetupGuideStatus } from '../../settings/settings'
import type { SetupGuideCrossContextStatus } from '../../settings/types'
import type { SocialNetworkUI } from '../../social-network/ui'
import { memoizePromise } from '../../utils/memoize'
import { safeGetActiveUI } from '../../utils/safeRequire'
import Serialization from '../../utils/type-transform/Serialization'
import { sideEffect } from '../../utils/side-effects'
import { untilDocumentReady } from '../../utils/dom'
import { sleep } from '../../utils/utils'
import { Flags } from '../../utils/flags'

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
        (url: string): Promise<string> => {
            return fetch(url).then((x) => x.text())
        },
        (x) => x,
    ),
    async SetupGuide(for_: ECKeyIdentifier) {
        getActivatedUI().taskStartSetupGuide(for_)
    },
    async noop() {},
}
const realTasks = AutomatedTabTask(_tasks, {
    memorable: true,
    AsyncCallOptions: { serializer: Serialization, strict: false },
})!
// console.log('To debug tasks, use globalThis.tasks, sleep fn is also available')
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
    if (!Flags.has_no_browser_tab_ui) return tasks(uri, { ...updatedOptions, ...options }, ...others)
    let _key: keyof typeof _tasks
    let _args: any[]
    async function p() {
        const tabs = await browser.tabs.query({})
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
    }
    const promise = p()
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
    if (!isEnvironment(Environment.ContentScript)) return

    //#region setup guide
    const network = getActivatedUI().networkIdentifier
    const id = currentSetupGuideStatus[network].value
    const onStatusUpdate = (id: string) => {
        const { persona, status }: SetupGuideCrossContextStatus = JSON.parse(id || '{}')
        if (persona && status) _tasks.SetupGuide(Identifier.fromString(persona, ECKeyIdentifier).unwrap())
    }
    currentSetupGuideStatus[network].addListener(onStatusUpdate)
    currentSetupGuideStatus[network].readyPromise.then(onStatusUpdate)
    onStatusUpdate(id)
    //#endregion
})
