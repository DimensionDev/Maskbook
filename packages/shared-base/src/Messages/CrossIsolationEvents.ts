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
    ITODialogEvent,
    PersonaBindFinishEvent,
    SmartPayDialogEvent,
    RenameWalletEvent,
    FollowLensDialogEvent,
    WalletsUpdatedEvent,
    RequestsUpdatedEvent,
    WalletLockStatusUpdatedEvent,
    walletLockTimeUpdatedEvent,
    GameDialogEvent,
    PopupWalletConnectEvent,
} from './Events.js'

/**
 * @deprecated
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
    ITODialogEvent: ITODialogEvent
    smartPayDialogEvent: SmartPayDialogEvent
    followLensDialogEvent: FollowLensDialogEvent
    popupWalletConnectEvent: PopupWalletConnectEvent
    walletsUpdated: WalletsUpdatedEvent
    requestsUpdated: RequestsUpdatedEvent
    walletLockStatusUpdated: WalletLockStatusUpdatedEvent
    walletLockTimeUpdated: walletLockTimeUpdatedEvent

    gameDialogUpdated: GameDialogEvent
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
