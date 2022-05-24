import { useCallback } from 'react'
import Services from '../../extension/service'
import { RedPacketMetadataReader } from '../../plugins/RedPacket/SNSAdaptor/helpers'
import { ImageTemplateTypes, socialNetworkEncoder } from '@masknet/encryption'
import { activatedSocialNetworkUI, globalUIState } from '../../social-network'
import { isTwitter } from '../../social-network-adaptor/twitter.com/base'
import { useI18N } from '../../utils'
import { SteganographyTextPayload } from '../InjectedComponents/SteganographyTextPayload'
import type { SubmitComposition } from './CompositionUI'
import { useLastRecognizedIdentity } from '../DataSource/useActivatedUI'
import { isFacebook } from '../../social-network-adaptor/facebook.com/base'
import type { ProfileIdentifier } from '@masknet/shared-base'

export function useSubmit(onClose: () => void, reason: 'timeline' | 'popup' | 'reply') {
    const { t } = useI18N()
    const lastRecognizedIdentity = useLastRecognizedIdentity()

    return useCallback(
        async (info: SubmitComposition) => {
            const { content, encode, target } = info
            const fallbackProfile: ProfileIdentifier | undefined = globalUIState.profiles.value[0]?.identifier
            if (encode === 'image' && !lastRecognizedIdentity) throw new Error('No Current Profile')

            const _encrypted = await Services.Crypto.encryptTo(
                content,
                target,
                lastRecognizedIdentity?.identifier ?? fallbackProfile,
                activatedSocialNetworkUI.encryptionNetwork,
            )
            const encrypted = socialNetworkEncoder(activatedSocialNetworkUI.encryptionNetwork, _encrypted)

            const redPacketPreText =
                isTwitter(activatedSocialNetworkUI) || isFacebook(activatedSocialNetworkUI)
                    ? t('additional_post_box__encrypted_post_pre_red_packet_twitter_official_account', {
                          encrypted,
                          account: isTwitter(activatedSocialNetworkUI) ? t('twitter_account') : t('facebook_account'),
                      })
                    : t('additional_post_box__encrypted_post_pre_red_packet', { encrypted })

            // TODO: move into the plugin system
            const redPacketMetadata = RedPacketMetadataReader(content.meta)
            if (encode === 'image') {
                const defaultText = t('additional_post_box__steganography_post_pre', {
                    random: new Date().toLocaleString(),
                })
                if (redPacketMetadata.ok) {
                    await pasteImage(redPacketPreText.replace(encrypted, '') ?? defaultText, encrypted, 'eth', reason)
                } else {
                    await pasteImage(defaultText, encrypted, 'v2', reason)
                }
            } else {
                pasteTextEncode(
                    (redPacketMetadata.ok ? redPacketPreText : null) ??
                        t('additional_post_box__encrypted_post_pre', { encrypted }),
                    reason,
                )
            }
            onClose()
        },
        [t, lastRecognizedIdentity, onClose, reason],
    )
}

function pasteTextEncode(text: string, reason: 'timeline' | 'popup' | 'reply') {
    activatedSocialNetworkUI.automation.nativeCompositionDialog?.appendText?.(text, {
        recover: true,
        reason,
    })
}
async function pasteImage(
    relatedTextPayload: string,
    encrypted: string,
    template: ImageTemplateTypes,
    reason: 'timeline' | 'popup' | 'reply',
) {
    const img = await SteganographyTextPayload(template, encrypted)
    // Don't await this, otherwise the dialog won't disappear
    activatedSocialNetworkUI.automation.nativeCompositionDialog!.attachImage!(img, {
        recover: true,
        relatedTextPayload,
        reason,
    })
}
