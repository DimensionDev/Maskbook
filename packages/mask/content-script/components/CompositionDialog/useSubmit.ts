import Services from '#services'
import { encodeByNetwork } from '@masknet/encryption'
import { PluginID, Sniffings, SOCIAL_MEDIA_NAME } from '@masknet/shared-base'
import type { Meta } from '@masknet/typed-message'
import { Telemetry } from '@masknet/web3-telemetry'
import { EventID, EventType } from '@masknet/web3-telemetry/types'
import { useCallback } from 'react'
import { useMaskSharedTrans } from '../../../shared-ui/index.js'
import { activatedSiteAdaptorUI } from '../../site-adaptor-infra/index.js'
import { useLastRecognizedIdentity } from '../DataSource/useActivatedUI.js'
import type { SubmitComposition } from './CompositionUI.js'
import { SteganographyPayload } from './SteganographyPayload.js'
import { msg } from '@lingui/macro'
import { useLingui, type I18nContext } from '@lingui/react'

export function useSubmit(onClose: () => void, reason: 'timeline' | 'popup' | 'reply') {
    const t = useMaskSharedTrans()
    const { _ } = useLingui()
    const lastRecognizedIdentity = useLastRecognizedIdentity()

    return useCallback(
        async (info: SubmitComposition) => {
            const { content, encode, target } = info
            if (encode === 'image' && !lastRecognizedIdentity) throw new Error('No Current Profile')

            // rawEncrypted is either string or Uint8Array
            // string is the old format, Uint8Array is the new format.
            const rawEncrypted = await Services.Crypto.encryptTo(
                info.version,
                content,
                target,
                lastRecognizedIdentity.identifier,
                activatedSiteAdaptorUI!.encryptPayloadNetwork,
            )
            // Since we cannot directly send binary in the composition box, we need to encode it into a string.
            const encrypted = encodeByNetwork(activatedSiteAdaptorUI!.encryptPayloadNetwork, rawEncrypted)

            const decoratedText =
                encode === 'image' ?
                    decorateEncryptedText('', t, _, content.meta)
                :   decorateEncryptedText(encrypted, t, _, content.meta)

            const options = { interpolation: { escapeValue: false } }
            const defaultText: string =
                encode === 'image' ?
                    t.additional_post_box__encrypted_post_pre({
                        encrypted: 'https://mask.io/',
                    })
                :   t.additional_post_box__encrypted_post_pre({ encrypted, ...options })
            const mediaObject =
                encode === 'image' ?
                    // We can send raw binary through the image, but for the text we still use the old way.
                    // For text, it must send the text _after_ encodeByNetwork, otherwise it will break backward compatibility.
                    await SteganographyPayload(typeof rawEncrypted === 'string' ? encrypted : rawEncrypted)
                :   undefined

            if (encode === 'image') {
                if (!mediaObject) throw new Error('Failed to create image payload.')
                // Don't await this, otherwise the dialog won't disappear
                activatedSiteAdaptorUI?.automation.nativeCompositionDialog?.attachImage?.(mediaObject, {
                    recover: true,
                    relatedTextPayload: decoratedText || defaultText,
                    reason,
                })
            } else {
                activatedSiteAdaptorUI?.automation.nativeCompositionDialog?.attachText?.(decoratedText || defaultText, {
                    recover: true,
                    reason,
                })
            }

            if (content.meta?.has(`${PluginID.RedPacket}:1`) || content.meta?.has(`${PluginID.RedPacket}_nft:1`))
                Telemetry.captureEvent(EventType.Interact, EventID.EntryAppLuckSend)
            Telemetry.captureEvent(EventType.Interact, EventID.EntryMaskComposeEncrypt)

            onClose()
        },
        [t, lastRecognizedIdentity, onClose, reason],
    )
}

// TODO: Provide API to plugin to post-process post content,
// then we can move these -PreText's and meta readers into plugin's own context
function decorateEncryptedText(
    encrypted: string,
    t: ReturnType<typeof useMaskSharedTrans>,
    _: I18nContext['_'],
    meta?: Meta,
): string | null {
    if (!meta) return null
    const hasOfficialAccount = Sniffings.is_twitter_page || Sniffings.is_facebook_page
    const officialAccount = Sniffings.is_twitter_page ? _(msg`realMaskNetwork`) : _(msg`masknetwork`)
    const token = meta.has(`${PluginID.RedPacket}:1`) ? _(msg`a token`) : _(msg`an NFT`)
    const sns = SOCIAL_MEDIA_NAME[activatedSiteAdaptorUI!.networkIdentifier]
    const options = { interpolation: { escapeValue: false }, token, sns }

    // Note: since this is in the composition stage, we can assume plugins don't insert old version of meta.
    if (meta.has(`${PluginID.RedPacket}:1`) || meta.has(`${PluginID.RedPacket}_nft:1`)) {
        return hasOfficialAccount ?
                t.additional_post_box__encrypted_post_pre_red_packet_sns_official_account({
                    encrypted,
                    account: officialAccount,
                    ...options,
                })
            :   t.additional_post_box__encrypted_post_pre_red_packet({ encrypted, ...options })
    } else if (meta.has(`${PluginID.FileService}:3`)) {
        return hasOfficialAccount ?
                t.additional_post_box__encrypted_post_pre_file_service_sns_official_account({
                    encrypted,
                    ...options,
                })
            :   t.additional_post_box__encrypted_post_pre_file_service({
                    encrypted,
                    ...options,
                })
    }
    return null
}
