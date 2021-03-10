import { untilDomLoaded } from '../utils/dom'
import type { SocialNetworkUI } from './types'
import { managedStateCreator } from './utils'

const definedSocialNetworkUIsLocal = new Set<SocialNetworkUI.DeferredDefinition>()
export const definedSocialNetworkUIs: ReadonlySet<SocialNetworkUI.DeferredDefinition> = definedSocialNetworkUIsLocal
export let activatedSocialNetworkUI: SocialNetworkUI.Definition = {
    automation: {},
    collecting: {},
    customization: {},
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
    const ui_deferred = [...definedSocialNetworkUIs].find((x) => x.shouldActivate(location))
    if (!ui_deferred) return

    console.log('Activating provider', ui_deferred.networkIdentifier)
    const ui = (activatedSocialNetworkUI = (await ui_deferred.load()).default)
    console.log('Provider activated. You can access it by globalThis.ui', ui)
    Object.assign(globalThis, { ui })

    const abort = new AbortController()
    const { signal } = abort
    untilDomLoaded().then(() => {
        globalUIState = { ...ui.init(signal), ...managedStateCreator() }
        // hookUIPostMap
        ui.collecting.identityProvider?.start(signal)
        ui.collecting.postsProvider?.start(signal)
        ui.collecting.profilesCollector?.(signal)
        ui.injection.pageInspector?.(signal)
        ui.injection.toolbar?.(signal)
        ui.injection.setupPrompt?.(signal)
        ui.injection.newPostComposition?.start?.(signal)
        ui.injection.searchResult?.(signal)
        ui.injection.userBadge?.(signal)
    })
    // TODO: i18n overwrite
}

export function defineSocialNetworkUI(UI: SocialNetworkUI.DeferredDefinition) {
    if (UI.notReadyForProduction && process.env.NODE_ENV === 'production') return UI
    definedSocialNetworkUIsLocal.add(UI)
    return UI
}
