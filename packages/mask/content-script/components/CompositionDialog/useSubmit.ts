import Services from '#services'
import { encodeByNetwork } from '@masknet/encryption'
import {
    PluginID,
    RedPacketMetaKey,
    RedPacketNftMetaKey,
    Sniffings,
    SOCIAL_MEDIA_NAME,
    SolanaRedPacketMetaKey,
} from '@masknet/shared-base'
import type { Meta } from '@masknet/typed-message'
import { Telemetry } from '@masknet/web3-telemetry'
import { EventID, EventType } from '@masknet/web3-telemetry/types'
import { useCallback } from 'react'
import { activatedSiteAdaptorUI } from '../../site-adaptor-infra/index.js'
import { useLastRecognizedIdentity } from '../DataSource/useActivatedUI.js'
import type { SubmitComposition } from './CompositionUI.js'
import { SteganographyPayload } from './SteganographyPayload.js'
import { msg } from '@lingui/core/macro'
import { useLingui, type I18nContext } from '@lingui/react'

export function useSubmit(onClose: () => void, reason: 'timeline' | 'popup' | 'reply', hasRedpacket?: boolean) {
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
            const encrypted = encodeByNetwork(activatedSiteAdaptorUI!.encryptPayloadNetwork, encode, rawEncrypted)

            const decoratedText =
                encode === 'image' ?
                    decorateEncryptedText('', _, content.meta)
                :   decorateEncryptedText(encrypted, _, content.meta)

            const wrapperText = encode === 'image' ? 'https://mask.io/' : encrypted
            const defaultText: string =
                activatedSiteAdaptorUI?.customization.i18nOverwrite?.postBoxEncryptedTextWrapper?.(wrapperText) ||
                _(
                    msg`Decrypt this post with #mask_io! 🎭🎭🎭 Tired of plaintext? Try to send encrypted messages to your friends. Install Mask.io to send your first encrypted tweet. ${encrypted}`,
                )
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
                    relatedTextPayload: `${decoratedText || defaultText} ${hasRedpacket ? '#MaskLuckyDrop' : ''}`,
                    reason,
                })
            } else {
                activatedSiteAdaptorUI?.automation.nativeCompositionDialog?.attachText?.(decoratedText || defaultText, {
                    recover: true,
                    reason,
                })
            }

            if (
                content.meta?.has(RedPacketMetaKey) ||
                content.meta?.has(RedPacketNftMetaKey) ||
                content.meta?.has(SolanaRedPacketMetaKey)
            )
                Telemetry.captureEvent(EventType.Interact, EventID.EntryAppLuckSend)
            Telemetry.captureEvent(EventType.Interact, EventID.EntryMaskComposeEncrypt)

            onClose()
        },
        [_, lastRecognizedIdentity, onClose, reason, hasRedpacket],
    )
}

// TODO: Provide API to plugin to post-process post content,
// then we can move these -PreText's and meta readers into plugin's own context
function decorateEncryptedText(encrypted: string, _: I18nContext['_'], meta?: Meta): string | null {
    if (!meta) return null
    const hasOfficialAccount = Sniffings.is_twitter_page || Sniffings.is_facebook_page
    const officialAccount = Sniffings.is_twitter_page ? _(msg`realMaskNetwork`) : _(msg`masknetwork`)
    const token = meta.has(RedPacketMetaKey) || meta.has(SolanaRedPacketMetaKey) ? _(msg`a token`) : _(msg`an NFT`)
    const sns = SOCIAL_MEDIA_NAME[activatedSiteAdaptorUI!.networkIdentifier]

    // Note: since this is in the composition stage, we can assume plugins don't insert old version of meta.
    if (meta.has(RedPacketMetaKey) || meta.has(RedPacketNftMetaKey) || meta.has(SolanaRedPacketMetaKey)) {
        const promote_red_packet = _(msg`Hi friends, I just created ${token} Lucky Drop. Download Mask.io to claim.`)
        const promote_red_packet2 = _(msg`🧧🧧🧧 Try sending Lucky Drop to your friends with Mask.io.`)
        return hasOfficialAccount ?
                promote_red_packet +
                    _(msg`Follow @${officialAccount} for Web3 updates and insights.`) +
                    ` \n\n${promote_red_packet2}\n\n${encrypted}`
            :   `${promote_red_packet}\n\n${promote_red_packet2}\n\n${encrypted}`
    } else if (meta.has(`${PluginID.FileService}:3`)) {
        const promote_file_service = _(
            msg`📃📃📃 Try to permanently use decentralized file storage on ${sns}. Install Mask.io to upload and share first permanent decentralized file, powered by mainstream decentralized storage solutions.`,
        )
        return `${promote_file_service}\n${encrypted}`
    }
    return null
}
