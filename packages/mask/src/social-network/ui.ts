import '../utils/debug/general'
import '../utils/debug/ui'
import Services from '../extension/service'
import { Flags, InMemoryStorages, PersistentStorages } from '../../shared'
import type { SocialNetworkUI } from './types'
import { currentSetupGuideStatus } from '../settings/settings'
import type { SetupGuideCrossContextStatus } from '../settings/types'
import {
    ECKeyIdentifier,
    createSubscriptionFromAsync,
    PersonaIdentifier,
    EnhanceableSite,
    i18NextInstance,
    createSubscriptionFromValueRef,
} from '@masknet/shared-base'
import { Environment, assertNotEnvironment, ValueRef } from '@dimensiondev/holoflows-kit'
import { IdentityResolved, startPluginSNSAdaptor } from '@masknet/plugin-infra/content-script'
import { getCurrentSNSNetwork } from '../social-network-adaptor/utils'
import { createPluginHost } from '../plugin-infra/host'
import { definedSocialNetworkUIs } from './define'
import { setupShadowRootPortal, MaskMessages } from '../utils'
import { delay, waitDocumentReadyState } from '@dimensiondev/kit'
import { sharedUINetworkIdentifier, sharedUIComponentOverwrite } from '@masknet/shared'
import { SocialNetworkEnum } from '@masknet/encryption'

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
    encryptionNetwork: SocialNetworkEnum.Unknown,
    networkIdentifier: EnhanceableSite.Localhost,
    shouldActivate: () => false,
    utils: { createPostContext: null! },
    notReadyForProduction: true,
    declarativePermissions: { origins: [] },
}
export let globalUIState: Readonly<SocialNetworkUI.AutonomousState> = {} as any

export async function activateSocialNetworkUIInner(ui_deferred: SocialNetworkUI.DeferredDefinition): Promise<void> {
    assertNotEnvironment(Environment.ManifestBackground)

    console.log('Activating provider', ui_deferred.networkIdentifier)
    const ui = (activatedSocialNetworkUI = await loadSocialNetworkUI(ui_deferred.networkIdentifier))

    sharedUINetworkIdentifier.value = ui_deferred.networkIdentifier
    if (ui.customization.sharedComponentOverwrite) {
        sharedUIComponentOverwrite.value = ui.customization.sharedComponentOverwrite
    }

    console.log('Provider activated. You can access it by globalThis.ui', ui)
    Object.assign(globalThis, { ui })

    const abort = new AbortController()
    const { signal } = abort
    if (import.meta.webpackHot) {
        console.log('SNS adaptor HMR enabled.')
        ui_deferred.hotModuleReload?.(async (newDefinition) => {
            console.log('SNS adaptor updated. Uninstalling current adaptor.')
            abort.abort()
            await delay(200)
            definedSocialNetworkUIsResolved.set(ui_deferred.networkIdentifier, newDefinition)
            activateSocialNetworkUIInner(ui_deferred)
        })
    }
    await waitDocumentReadyState('interactive')

    i18nOverwrite()
    globalUIState = await ui.init(signal)

    ui.customization.paletteMode?.start(signal)
    startIntermediateSetupGuide()
    $unknownIdentityResolution()

    ui.collecting.postsProvider?.start(signal)
    startPostListener()
    ui.collecting.currentVisitingIdentityProvider?.start(signal)

    ui.injection.pageInspector?.(signal)
    if (Flags.toolbox_enabled) {
        ui.injection.toolbox?.(signal, 'wallet')
        ui.injection.toolbox?.(signal, 'application')
    }
    ui.injection.setupPrompt?.(signal)
    ui.injection.newPostComposition?.start?.(signal)
    ui.injection.searchResult?.(signal)
    ui.injection.userBadge?.(signal)

    ui.injection.profileTab?.(signal)
    ui.injection.profileTabContent?.(signal)

    ui.injection.userAvatar?.(signal)
    ui.injection.profileAvatar?.(signal)
    ui.injection.profileTip?.(signal)

    ui.injection.enhancedProfileNFTAvatar?.(signal)
    ui.injection.openNFTAvatar?.(signal)
    ui.injection.postAndReplyNFTAvatar?.(signal)
    ui.injection.avatarClipNFT?.(signal)

    // Update user avatar
    ui.collecting.currentVisitingIdentityProvider?.recognized.addListener((ref) => {
        if (ref.avatar && ref.identifier) {
            Services.Identity.updateProfileInfo(ref.identifier, { avatarURL: ref.avatar })
        }
    })

    startPluginSNSAdaptor(
        getCurrentSNSNetwork(ui.networkIdentifier),
        createPluginHost(signal, (pluginID, signal) => {
            const personaSub = createSubscriptionFromAsync(
                Services.Settings.getCurrentPersonaIdentifier,
                undefined as PersonaIdentifier | undefined,
                MaskMessages.events.currentPersonaIdentifier.on,
                signal,
            )
            const empty = new ValueRef<IdentityResolved | undefined>(undefined)
            const lastRecognizedSub = createSubscriptionFromValueRef(
                ui.collecting.identityProvider?.recognized || empty,
                signal,
            )
            const currentVisitingSub = createSubscriptionFromValueRef(
                ui.collecting.currentVisitingIdentityProvider?.recognized || empty,
                signal,
            )
            return {
                createKVStorage(type, defaultValues) {
                    if (type === 'memory')
                        return InMemoryStorages.Plugin.createSubScope(pluginID, defaultValues, signal)
                    else return PersistentStorages.Plugin.createSubScope(pluginID, defaultValues, signal)
                },
                personaSign: Services.Identity.signWithPersona,
                walletSign: Services.Ethereum.personalSign,
                currentPersona: personaSub,
                lastRecognizedProfile: lastRecognizedSub,
                currentVisitingProfile: currentVisitingSub,
            }
        }),
    )

    setupShadowRootPortal()

    function i18nOverwrite() {
        const i18n = ui.customization.i18nOverwrite || {}
        for (const namespace in i18n) {
            const ns = i18n[namespace]
            for (const i18nKey in ns) {
                const pair = i18n[namespace][i18nKey]
                for (const language in pair) {
                    const value = pair[language]
                    i18NextInstance.addResource(language, namespace, i18nKey, value)
                }
            }
        }
    }

    function $unknownIdentityResolution() {
        const provider = ui.collecting.identityProvider
        if (!provider) return
        provider.start(signal)
        provider.recognized.addListener((newValue, oldValue) => {
            if (document.visibilityState === 'hidden') return
            if (newValue.identifier === oldValue.identifier) return
            if (!newValue.identifier) return

            MaskMessages.events.Native_visibleSNS_currentDetectedProfileUpdated.sendToBackgroundPage(
                newValue.identifier,
            )
        })
        if (provider.hasDeprecatedPlaceholderName) {
            provider.recognized.addListener((id) => {
                if (signal.aborted) return
                if (!id.identifier) return
                Services.Identity.resolveUnknownLegacyIdentity(id.identifier)
            })
        }
    }

    function startPostListener() {
        const posts = ui.collecting.postsProvider?.posts
        if (!posts) return
        const abortSignals = new WeakMap<object, AbortController>()
        posts.event.on('set', async (key, value) => {
            await unmount(key)
            const abort = new AbortController()
            signal.addEventListener('abort', () => abort.abort())
            abortSignals.set(key, abort)
            const { signal: postSignal } = abort
            ui.injection.enhancedPostRenderer?.(postSignal, value)
            ui.injection.postInspector?.(postSignal, value)
            ui.injection.postActions?.(postSignal, value)
            ui.injection.commentComposition?.compositionBox(postSignal, value)
            ui.injection.commentComposition?.commentInspector(postSignal, value)
        })
        posts.event.on('delete', unmount)
        function unmount(key: object) {
            if (!abortSignals.has(key)) return
            abortSignals.get(key)!.abort()
            // AbortSignal need an event loop
            // unmount a React root need another one.
            // let's guess a number that the React root will unmount.
            return delay(16 * 3)
        }
    }

    function startIntermediateSetupGuide() {
        const network = ui.networkIdentifier
        const id = currentSetupGuideStatus[network].value
        let started = false
        const onStatusUpdate = (id: string) => {
            const { persona, status }: SetupGuideCrossContextStatus = JSON.parse(id || '{}')
            if (persona && status && !started) {
                started = true
                ui.injection.setupWizard?.(signal, ECKeyIdentifier.from(persona).unwrap())
            }
        }
        currentSetupGuideStatus[network].addListener(onStatusUpdate)
        currentSetupGuideStatus[network].readyPromise.then(onStatusUpdate)
        onStatusUpdate(id)
    }
}

export async function loadSocialNetworkUIs(): Promise<SocialNetworkUI.Definition[]> {
    const defines = [...definedSocialNetworkUIs.values()].map(async (x) => x.load())
    const uis = (await Promise.all(defines)).map((x) => x.default)

    if (!defines) throw new Error('SNS adaptor load failed')

    for (const ui of uis) {
        definedSocialNetworkUIsResolved.set(ui.networkIdentifier, ui)
    }

    return uis
}

export async function loadSocialNetworkUI(identifier: string): Promise<SocialNetworkUI.Definition> {
    if (definedSocialNetworkUIsResolved.has(identifier)) return definedSocialNetworkUIsResolved.get(identifier)!
    const define = definedSocialNetworkUIs.get(identifier)
    if (!define) throw new Error('SNS adaptor not found')
    const ui = (await define.load()).default
    definedSocialNetworkUIsResolved.set(identifier, ui)
    if (import.meta.webpackHot) {
        define.hotModuleReload?.((ui) => definedSocialNetworkUIsResolved.set(identifier, ui))
    }
    return ui
}
export function loadSocialNetworkUISync(identifier: string): SocialNetworkUI.Definition | null {
    if (definedSocialNetworkUIsResolved.has(identifier)) return definedSocialNetworkUIsResolved.get(identifier)!
    return null
}
