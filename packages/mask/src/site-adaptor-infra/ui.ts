import { createElement } from 'react'
import stringify from 'json-stable-stringify'
import { assertNotEnvironment, Environment } from '@dimensiondev/holoflows-kit'
import { delay, waitDocumentReadyState } from '@masknet/kit'
import type { SiteAdaptorUI } from '@masknet/types'
import { type Plugin, startPluginSiteAdaptor, SiteAdaptorContextRef } from '@masknet/plugin-infra/content-script'
import { __setSiteAdaptorContext__ } from '@masknet/plugin-infra/content-script/context'
import { Modals, sharedUIComponentOverwrite, sharedUINetworkIdentifier, type ModalProps } from '@masknet/shared'
import {
    createSubscriptionFromValueRef,
    currentPersonaIdentifier,
    currentSetupGuideStatus,
    DashboardRoutes,
    ECKeyIdentifier,
    i18NextInstance,
    queryRemoteI18NBundle,
    type SetupGuideContext,
    SetupGuideStep,
    setDebugObject,
} from '@masknet/shared-base'
import { Flags } from '@masknet/flags'
import { Telemetry } from '@masknet/web3-telemetry'
import { ExceptionID, ExceptionType } from '@masknet/web3-telemetry/types'
import { createPartialSharedUIContext, createPluginHost } from '../../shared/plugin-infra/host.js'
import Services from '#services'
import { getCurrentIdentifier } from '../site-adaptors/utils.js'
import { attachReactTreeWithoutContainer, setupReactShadowRootEnvironment } from '../utils/index.js'
import '../utils/debug/general.js'
import { configureSelectorMissReporter } from '../utils/startWatch.js'
import { NextSharedUIContext, RestPartOfPluginUIContextShared } from '../utils/plugin-context-shared-ui.js'
import { definedSiteAdaptorsUI } from './define.js'

const definedSiteAdaptorsResolved = new Map<string, SiteAdaptorUI.Definition>()

export let activatedSiteAdaptorUI: SiteAdaptorUI.Definition | undefined
export let activatedSiteAdaptor_state: Readonly<SiteAdaptorUI.AutonomousState> | undefined

export async function activateSiteAdaptorUIInner(ui_deferred: SiteAdaptorUI.DeferredDefinition): Promise<void> {
    assertNotEnvironment(Environment.ManifestBackground)

    console.log('Activating provider', ui_deferred.networkIdentifier)

    const injectSwitchSettings = await Services.Settings.getAllInjectSwitchSettings()
    if (!injectSwitchSettings[ui_deferred.networkIdentifier]) return

    configureSelectorMissReporter((name) => {
        const error = new Error(`Selector "${name}" does not match anything ${location.href}.`)
        error.stack = ''
        Telemetry.captureException(ExceptionType.Error, ExceptionID.Debug, error, {
            sampleRate: 0.01,
        })
    })
    setupReactShadowRootEnvironment()
    const ui = (activatedSiteAdaptorUI = await loadSiteAdaptorUI(ui_deferred.networkIdentifier))

    sharedUINetworkIdentifier.value = ui_deferred.networkIdentifier
    if (ui.customization.sharedComponentOverwrite) {
        sharedUIComponentOverwrite.value = ui.customization.sharedComponentOverwrite
    }

    console.log('Provider activated. You can access it by globalThis.ui', ui)
    setDebugObject('ui', ui)

    const abort = new AbortController()
    const { signal } = abort
    if (import.meta.webpackHot) {
        console.log('Site adaptor HMR enabled.')
        ui_deferred.hotModuleReload?.(async (newDefinition) => {
            console.log('Site adaptor updated. Uninstalling current adaptor.')
            abort.abort()
            await delay(200)
            definedSiteAdaptorsResolved.set(ui_deferred.networkIdentifier, newDefinition)
            activateSiteAdaptorUIInner(ui_deferred)
        })
    }

    await waitDocumentReadyState('interactive')

    i18nOverwrite()

    await ui.collecting.themeSettingsProvider?.start(signal)

    activatedSiteAdaptor_state = await ui.init(signal)

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

    ui.injection.switchLogo?.(signal)
    ui.injection.PluginSettingsDialog?.(signal)
    ui.injection.calendar?.(signal)

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

    const lastRecognizedSub = createSubscriptionFromValueRef(ui.collecting.identityProvider.recognized, signal)
    const currentVisitingSub = createSubscriptionFromValueRef(
        ui.collecting.currentVisitingIdentityProvider.recognized,
        signal,
    )
    const connectPersona = async () => {
        const currentPersonaIdentifier = await Services.Settings.getCurrentPersonaIdentifier()
        currentSetupGuideStatus[activatedSiteAdaptorUI!.networkIdentifier].value = stringify({
            status: SetupGuideStep.FindUsername,
            persona: currentPersonaIdentifier?.toText(),
        })
    }

    __setSiteAdaptorContext__({
        lastRecognizedProfile: lastRecognizedSub,
        currentVisitingProfile: currentVisitingSub,
        allPersonas: NextSharedUIContext.allPersonas,
        queryPersonaAvatar: Services.Identity.getPersonaAvatar,
        currentNextIDPlatform: ui.configuration.nextIDConfig?.platform,
        currentPersonaIdentifier: createSubscriptionFromValueRef(currentPersonaIdentifier, signal),
    })
    SiteAdaptorContextRef.value = {
        ...RestPartOfPluginUIContextShared,
        getPostIdFromNewPostToast: ui.configuration.nextIDConfig?.getPostIdFromNewPostToast,
        getPostURL: ui.utils.getPostURL,
        share: ui.utils.share,
        getUserIdentity: ui.utils.getUserIdentity,
        createPersona: () => Services.Helper.openDashboard(DashboardRoutes.SignUpPersona),
        connectPersona,
        fetchManifest: Services.ThirdPartyPlugin.fetchManifest,
        getSocialIdentity: Services.Identity.querySocialIdentity,
        queryPersonaByProfile: Services.Identity.queryPersonaByProfile,
        attachProfile: Services.Identity.attachProfile,
        postMessage: ui.automation?.nativeCompositionDialog?.appendText,
        setCurrentPersonaIdentifier: Services.Settings.setCurrentPersonaIdentifier,
        setPluginMinimalModeEnabled: Services.Settings.setPluginMinimalModeEnabled,
        getSearchedKeyword: ui.collecting.getSearchedKeyword,
        hasHostPermission: Services.Helper.hasHostPermission,
        requestHostPermission: Services.Helper.requestHostPermission,
    }

    startPluginSiteAdaptor(
        ui.networkIdentifier,
        createPluginHost(
            signal,
            (id, def, signal): Plugin.SiteAdaptor.SiteAdaptorContext => {
                return {
                    setMinimalMode(enabled) {
                        Services.Settings.setPluginMinimalModeEnabled(id, enabled)
                    },
                    ...createPartialSharedUIContext(id, def, signal),
                    ...SiteAdaptorContextRef.value,
                }
            },
            Services.Settings.getPluginMinimalModeEnabled,
            Services.Helper.hasHostPermission,
        ),
    )
    attachReactTreeWithoutContainer(
        'Modals',
        createElement(Modals, {
            createWallet: () => Services.Helper.openDashboard(DashboardRoutes.CreateMaskWalletForm),
        } satisfies ModalProps),
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
            ui.injection.postReplacer?.(postSignal, value)
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

export async function loadSiteAdaptorUI(identifier: string): Promise<SiteAdaptorUI.Definition> {
    if (definedSiteAdaptorsResolved.has(identifier)) return definedSiteAdaptorsResolved.get(identifier)!
    const define = definedSiteAdaptorsUI.get(identifier)
    if (!define) throw new Error('Site adaptor not found')
    const ui = (await define.load()).default
    definedSiteAdaptorsResolved.set(identifier, ui)
    if (import.meta.webpackHot) {
        define.hotModuleReload?.((ui) => definedSiteAdaptorsResolved.set(identifier, ui))
    }
    return ui
}
