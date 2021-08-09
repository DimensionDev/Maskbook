import type { ThirdPartyPopupContextIdentifier } from '../../plugins/External/popup-context'

export const currentPopupContext = new URL(location.href).searchParams.get(
    'mask_context',
) as ThirdPartyPopupContextIdentifier | null

export const currentBaseURL = new URL('./', location.href).toString()

export enum SDKErrors {
    M1_Lack_context_identifier = 'MaskErr/1: This page does not tied to any SNS context.',
    M2_Context_disconnected = 'MaskErr/2: The SNS context associated with this page has gone.',
    M3_Permission_denied = 'MaskErr/3: Permission not granted.',
}
