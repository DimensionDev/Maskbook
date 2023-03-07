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
    OpenPageConfirmEvent,
    PersonaSelectPanelDialogEvent,
    AvatarSettingDialogEvent,
    redpacketDialogEvent,
    PersonaBindFinishEvent,
    SmartPayDialogEvent,
} from './Mask.js'

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
export const CrossIsolationMessages = new WebExtensionMessage<CrossIsolationEvents>({ domain: 'cross-isolation' })

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
    nonFungibleTokenDialogEvent: NonFungibleTokenDialogEvent
    walletSettingsDialogEvent: WalletSettingsDialogEvent
    avatarSettingDialogEvent: AvatarSettingDialogEvent
    redpacketDialogEvent: redpacketDialogEvent
    smartPayDialogEvent: SmartPayDialogEvent
    /** emit when open new page . */
    openPageConfirm: OpenPageConfirmEvent
    /**
     * Application Persona List dialog
     */
    PersonaSelectPanelDialogUpdated: PersonaSelectPanelDialogEvent
}
