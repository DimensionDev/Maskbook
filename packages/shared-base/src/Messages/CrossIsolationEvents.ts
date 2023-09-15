import { WebExtensionMessage } from '@dimensiondev/holoflows-kit'
import type {
    CheckSecurityConfirmationDialogEvent,
    CompositionDialogEvent,
    Web3ProfileDialogEvent,
    CheckSecurityDialogEvent,
    ApplicationDialogEvent,
    HideSearchResultInspectorEvent,
    SwapDialogEvent,
    ProfileCardEvent,
    SettingsDialogEvent,
    NonFungibleTokenDialogEvent,
    WalletSettingsDialogEvent,
    AvatarSettingDialogEvent,
    redpacketDialogEvent,
    PersonaBindFinishEvent,
    SmartPayDialogEvent,
    RenameWalletEvent,
    FollowLensDialogEvent,
    RequestsUpdatedEvent,
    WalletLockStatusUpdatedEvent,
    GameDialogEvent,
    PopupWalletConnectEvent,
    SwitchLogoDialogEvent,
    PasswordStatusUpdatedEvent,
} from './Events.js'

/**
 * Prefer MaskMessages.
 *
 * Only use this in the following cases:
 *
 * - You need to send message across different plugins
 *       e.g. from the packages/plugins/Example to packages/plugins/Example2
 * - You need to send message from plugin
 *       e.g. packages/plugins/Example to the main Mask extension.
 */
// TODO: find a way to use a good API for cross isolation communication.
export let CrossIsolationMessages: { readonly events: PluginMessageEmitter<CrossIsolationEvents> } =
    new WebExtensionMessage<CrossIsolationEvents>({ domain: 'cross-isolation' })

export function __workaround__replaceImplementationOfCrossIsolationMessage__(msg: PluginMessageEmitter<any>) {
    CrossIsolationMessages = { events: msg }
}

export interface CrossIsolationEvents {
    compositionDialogEvent: CompositionDialogEvent
    web3ProfileDialogEvent: Web3ProfileDialogEvent
    hideSearchResultInspectorEvent: HideSearchResultInspectorEvent
    checkSecurityDialogEvent: CheckSecurityDialogEvent
    checkSecurityConfirmationDialogEvent: CheckSecurityConfirmationDialogEvent
    applicationDialogEvent: ApplicationDialogEvent
    personaBindFinished: PersonaBindFinishEvent
    swapDialogEvent: SwapDialogEvent
    settingsDialogEvent: SettingsDialogEvent
    profileCardEvent: ProfileCardEvent
    renameWallet: RenameWalletEvent
    nonFungibleTokenDialogEvent: NonFungibleTokenDialogEvent
    walletSettingsDialogEvent: WalletSettingsDialogEvent
    avatarSettingDialogEvent: AvatarSettingDialogEvent
    redpacketDialogEvent: redpacketDialogEvent
    smartPayDialogEvent: SmartPayDialogEvent
    followLensDialogEvent: FollowLensDialogEvent
    popupWalletConnectEvent: PopupWalletConnectEvent
    walletsUpdated: void
    requestsUpdated: RequestsUpdatedEvent
    walletLockStatusUpdated: WalletLockStatusUpdatedEvent
    passwordStatusUpdated: PasswordStatusUpdatedEvent
    walletLockTimeUpdated: void
    gameDialogUpdated: GameDialogEvent
    switchLogoDialogUpdated: SwitchLogoDialogEvent
}

export type PluginMessageEmitter<T> = { readonly [key in keyof T]: PluginMessageEmitterItem<T[key]> }
export interface PluginMessageEmitterItem<T> {
    /** @returns A function to remove the listener */
    on(callback: (data: T) => void, options?: { signal?: AbortSignal }): () => void
    off(callback: (data: T) => void): void
    sendToLocal(data: T): void
    sendToContentScripts?(data: T): void
    sendToBackgroundPage(data: T): void
    sendToVisiblePages(data: T): void
    sendByBroadcast(data: T): void
    sendToAll(data: T): void

    pause?(): (reducer?: (data: T[]) => T[]) => Promise<void>
}
