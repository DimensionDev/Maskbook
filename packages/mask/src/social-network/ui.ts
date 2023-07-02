import stringify from 'json-stable-stringify'
import { assertNotEnvironment, Environment } from '@dimensiondev/holoflows-kit'
import { delay, waitDocumentReadyState } from '@masknet/kit'
import type { SocialNetworkUI } from '@masknet/types'
import { type Plugin, startPluginSNSAdaptor, SNSAdaptorContextRef } from '@masknet/plugin-infra/content-script'
import { sharedUIComponentOverwrite, sharedUINetworkIdentifier } from '@masknet/shared'
import {
    createSubscriptionFromAsync,
    createSubscriptionFromValueRef,
    currentPersonaIdentifier,
    currentSetupGuideStatus,
    DashboardRoutes,
    ECKeyIdentifier,
    i18NextInstance,
    MaskMessages,
    queryRemoteI18NBundle,
    type SetupGuideContext,
    SetupGuideStep,
} from '@masknet/shared-base'
import { Flags } from '@masknet/flags'
import { Sentry } from '@masknet/web3-telemetry'
import { ExceptionID, ExceptionType } from '@masknet/web3-telemetry/types'
import { createPartialSharedUIContext, createPluginHost } from '../../shared/plugin-infra/host.js'
import Services from '../extension/service.js'
import { getCurrentIdentifier, getCurrentSNSNetwork } from '../social-network-adaptor/utils.js'
import { configureSelectorMissReporter, setupReactShadowRootEnvironment } from '../utils/index.js'
import '../utils/debug/general.js'
import { RestPartOfPluginUIContextShared } from '../utils/plugin-context-shared-ui.js'
import { definedSocialNetworkUIs } from './define.js'

const definedSocialNetworkUIsResolved = new Map<string, SocialNetworkUI.Definition>()

export let activatedSocialNetworkUI: SocialNetworkUI.Definition = {} as any
export let globalUIState: Readonly<SocialNetworkUI.AutonomousState> = {} as any

export async function activateSocialNetworkUIInner(ui_deferred: SocialNetworkUI.DeferredDefinition): Promise<void> {
    assertNotEnvironment(Environment.ManifestBackground)

    console.log('Activating provider', ui_deferred.networkIdentifier)
    configureSelectorMissReporter((name) => {
        if (crypto.getRandomValues(new Uint8Array(1))[0] > 26) return
        const error = new Error(`Selector "${name}" does not match anything ${location.href}.`)
        error.stack = ''
        Sentry.captureException({
            error,
            exceptionID: ExceptionID.Debug,
            exceptionType: ExceptionType.Error,
            sampleRate: 0.01,
        })
    })
    setupReactShadowRootEnvironment()
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

    await ui.collecting.themeSettingsProvider?.start(signal)

    globalUIState = await ui.init(signal)

    startIntermediateSetupGuide()
    $unknownIdentityResolution()

    ui.collecting.postsProvider?.start(signal)
    startPostListener()
    ui.collecting.currentVisitingIdentityProvider?.start(signal)

    ui.injection.pageInspector?.(signal)
    ui.injection.toolbox?.(signal, 'wallet')
    ui.injection.toolbox?.(signal, 'application')
    ui.injection.newPostComposition?.start?.(signal)
    ui.injection.searchResult?.(signal)
    ui.injection.userBadge?.(signal)

    ui.injection.profileTab?.(signal)
    ui.injection.profileTabContent?.(signal)

    ui.injection.profileCover?.(signal)
    ui.injection.userAvatar?.(signal)
    ui.injection.profileAvatar?.(signal)
    ui.injection.tips?.(signal)
    ui.injection.lens?.(signal)

    ui.injection.enhancedProfileNFTAvatar?.(signal)
    ui.injection.openNFTAvatar?.(signal)
    ui.injection.postAndReplyNFTAvatar?.(signal)

    ui.injection.avatar?.(signal)
    ui.injection.profileCard?.(signal)

    ui.injection.PluginSettingsDialog?.(signal)

    // Update user avatar
    ui.collecting.currentVisitingIdentityProvider?.recognized.addListener((ref) => {
        if (!(ref.avatar && ref.identifier)) return
        Services.Identity.updateProfileInfo(ref.identifier, { avatarURL: ref.avatar, nickname: ref.nickname })
        const currentProfile = getCurrentIdentifier()
        if (currentProfile?.linkedPersona) {
            Services.Identity.createNewRelation(ref.identifier, currentProfile.linkedPersona)
        }
    })

    signal.addEventListener('abort', queryRemoteI18NBundle(Services.Helper.queryRemoteI18NBundle))

    const allPersonaSub = createSubscriptionFromAsync(
        () => Services.Identity.queryOwnedPersonaInformation(true),
        [],
        (x) => {
            const clearCurrentPersonaIdentifier = MaskMessages.events.currentPersonaIdentifier.on(x)
            const clearOwnPersonaChanged = MaskMessages.events.ownPersonaChanged.on(x)

            return () => {
                clearCurrentPersonaIdentifier()
                clearOwnPersonaChanged()
            }
        },
        signal,
    )

    const lastRecognizedSub = createSubscriptionFromValueRef(ui.collecting.identityProvider.recognized, signal)
    const currentVisitingSub = createSubscriptionFromValueRef(
        ui.collecting.currentVisitingIdentityProvider.recognized,
        signal,
    )
    const themeSettingsSub = createSubscriptionFromValueRef(ui.collecting.themeSettingsProvider.recognized, signal)

    const createPersona = () => {
        Services.Helper.openDashboard(DashboardRoutes.Setup)
    }

    const connectPersona = async () => {
        const currentPersonaIdentifier = await Services.Settings.getCurrentPersonaIdentifier()
        currentSetupGuideStatus[activatedSocialNetworkUI.networkIdentifier].value = stringify({
            status: SetupGuideStep.FindUsername,
            persona: currentPersonaIdentifier?.toText(),
        })
    }

    SNSAdaptorContextRef.value = {
        ...RestPartOfPluginUIContextShared,
        lastRecognizedProfile: lastRecognizedSub,
        currentVisitingProfile: currentVisitingSub,
        NFTAvatarTimelineUpdated: MaskMessages.events.NFTAvatarTimelineUpdated,
        allPersonas: allPersonaSub,
        themeSettings: themeSettingsSub,
        getThemeSettings: () => activatedSocialNetworkUI.configuration.themeSettings,
        getNextIDPlatform: () => activatedSocialNetworkUI.configuration.nextIDConfig?.platform,
        getPersonaAvatar: Services.Identity.getPersonaAvatar,
        getSocialIdentity: Services.Identity.querySocialIdentity,
        ownProofChanged: MaskMessages.events.ownProofChanged,
        setMinimalMode: Services.Settings.setPluginMinimalModeEnabled,
        getPostURL: ui.utils.getPostURL,
        share: ui.utils.share,
        queryPersonaByProfile: Services.Identity.queryPersonaByProfile,
        createPersona,
        connectPersona,
        ownPersonaChanged: MaskMessages.events.ownPersonaChanged,
        currentPersonaIdentifier,
        getUserIdentity: activatedSocialNetworkUI.utils.getUserIdentity,
        fetchManifest: Services.ThirdPartyPlugin.fetchManifest,
        attachProfile: Services.Identity.attachProfile,
        setCurrentPersonaIdentifier: Services.Settings.setCurrentPersonaIdentifier,
        getPersonaAvatars: Services.Identity.getPersonaAvatars,
        getPostIdFromNewPostToast: activatedSocialNetworkUI.configuration.nextIDConfig?.getPostIdFromNewPostToast,
        postMessage: activatedSocialNetworkUI.automation?.nativeCompositionDialog?.appendText,
        setPluginMinimalModeEnabled: Services.Settings.setPluginMinimalModeEnabled,
    }

    startPluginSNSAdaptor(
        getCurrentSNSNetwork(ui.networkIdentifier),
        createPluginHost(
            signal,
            (id, signal): Plugin.SNSAdaptor.SNSAdaptorContext => {
                return {
                    ...createPartialSharedUIContext(id, signal),
                    ...SNSAdaptorContextRef.value,
                }
            },
            Services.Settings.getPluginMinimalModeEnabled,
            Services.Helper.hasHostPermission,
        ),
    )

    // TODO: receive the signal
    if (Flags.sandboxedPluginRuntime) import('./sandboxed-plugin.js')

    function i18nOverwrite() {
        const i18n = ui.customization.i18nOverwrite || {}
        for (const namespace of Object.keys(i18n)) {
            const ns = i18n[namespace]
            for (const i18nKey of Object.keys(ns)) {
                const pair = i18n[namespace][i18nKey]
                for (const language of Object.keys(pair)) {
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
            const { persona, status }: SetupGuideContext = JSON.parse(id || '{}')
            if (persona && status && !started) {
                started = true
                ui.injection.setupWizard?.(
                    signal,
                    ECKeyIdentifier.from(persona).expect(`${persona} should be a valid ECKeyIdentifier`),
                )
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
