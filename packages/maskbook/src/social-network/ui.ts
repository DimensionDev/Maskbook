import Services from '../extension/service'
import { untilDomLoaded } from '../utils/dom'
import { Flags } from '../utils/flags'
import i18nNextInstance from '../utils/i18n-next'
import type { SocialNetworkUI } from './types'
import { managedStateCreator } from './utils'

const definedSocialNetworkUIsLocal = new Map<string, SocialNetworkUI.DeferredDefinition>()
export const definedSocialNetworkUIs: ReadonlyMap<
    string,
    SocialNetworkUI.DeferredDefinition
> = definedSocialNetworkUIsLocal
const definedSocialNetworkUIsResolved = new Map<string, SocialNetworkUI.Definition>()
export let activatedSocialNetworkUI: SocialNetworkUI.Definition = {
    automation: {},
    collecting: {},
    customization: {},
    configuration: {},
    permission: {
        has: async () => false,
        request: async () => false,
    },
    init: () => {
        throw new Error()
    },
    injection: {},
    networkIdentifier: 'localhost',
    shouldActivate: () => false,
    utils: {},
    notReadyForProduction: true,
}
export let globalUIState: Readonly<SocialNetworkUI.State> = {} as any

export async function activateSocialNetworkUI(): Promise<void> {
    const ui_deferred = [...definedSocialNetworkUIs.values()].find((x) => x.shouldActivate(location))
    if (!ui_deferred) return

    console.log('Activating provider', ui_deferred.networkIdentifier)
    const ui = (activatedSocialNetworkUI = (await ui_deferred.load()).default)
    console.log('Provider activated. You can access it by globalThis.ui', ui)
    Object.assign(globalThis, { ui })

    const abort = new AbortController()
    const { signal } = abort
    await untilDomLoaded()

    i18nOverwrite()
    const state = await ui.init(signal)
    globalUIState = { ...state, ...managedStateCreator() }

    ui.customization.paletteMode?.start(signal)
    $unknownIdentityResolution()
    ui.collecting.postsProvider?.start(signal)
    startPostListener()
    ui.collecting.profilesCollector?.(signal)
    ui.injection.pageInspector?.(signal)
    if (Flags.toolbar_enabled) ui.injection.toolbar?.(signal)
    ui.injection.setupPrompt?.(signal)
    ui.injection.newPostComposition?.start?.(signal)
    ui.injection.searchResult?.(signal)
    ui.injection.userBadge?.(signal)

    function i18nOverwrite() {
        const i18n = ui.customization.i18nOverwrite || {}
        for (const namespace in i18n) {
            const ns = i18n[namespace]
            for (const i18nKey in ns) {
                const pair = i18n[namespace][i18nKey]
                for (const language in pair) {
                    const value = pair[language]
                    i18nNextInstance.addResource(language, namespace, i18nKey, value)
                }
            }
        }
    }

    function $unknownIdentityResolution() {
        const provider = ui.collecting.identityProvider
        provider?.start(signal)
        if (provider?.hasDeprecatedPlaceholderName) {
            provider.lastRecognized.addListener((id) => {
                if (signal.aborted) return
                if (id.identifier.isUnknown) return
                Services.Identity.resolveIdentity(id.identifier)
            })
        }
    }

    function startPostListener() {
        const posts = ui.collecting.postsProvider?.posts
        if (!posts) return
        const abortSignals = new WeakMap<object, AbortController>()
        posts.event.on('set', (key, value) => {
            const abort = new AbortController()
            abortSignals.set(key, abort)
            const { signal } = abort
            ui.injection.enhancedPostRenderer?.(signal, value)
            ui.injection.postInspector?.(signal, value)
            ui.injection.commentComposition?.compositionBox(signal, value)
            ui.injection.commentComposition?.commentInspector(signal, value)
        })
        posts.event.on('delete', (key) => {
            abortSignals.get(key)?.abort()
        })
    }
}

export async function loadSocialNetworkUI(identifier: string): Promise<SocialNetworkUI.Definition> {
    if (definedSocialNetworkUIsResolved.has(identifier)) return definedSocialNetworkUIsResolved.get(identifier)!
    const define = definedSocialNetworkUIs.get(identifier)
    if (!define) throw new Error('SNS adaptor not found')
    const ui = (await define.load()).default
    definedSocialNetworkUIsResolved.set(identifier, ui)
    return ui
}

export function defineSocialNetworkUI(UI: SocialNetworkUI.DeferredDefinition) {
    if (UI.notReadyForProduction && process.env.NODE_ENV === 'production') return UI
    definedSocialNetworkUIsLocal.set(UI.networkIdentifier, UI)
    return UI
}
