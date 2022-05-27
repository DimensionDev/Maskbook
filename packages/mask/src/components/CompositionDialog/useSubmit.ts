import { ImageTemplateTypes, socialNetworkEncoder } from '@masknet/encryption'
import { FileInfoMetadataReader } from '@masknet/plugin-file-service'
import type { ProfileIdentifier } from '@masknet/shared-base'
import type { Meta } from '@masknet/typed-message'
import { useCallback } from 'react'
import Services from '../../extension/service'
import { ITO_MetadataReader } from '../../plugins/ITO/SNSAdaptor/helpers'
import { RedPacketMetadataReader } from '../../plugins/RedPacket/SNSAdaptor/helpers'
import { activatedSocialNetworkUI, globalUIState } from '../../social-network'
import { isFacebook } from '../../social-network-adaptor/facebook.com/base'
import { isTwitter } from '../../social-network-adaptor/twitter.com/base'
import { I18NFunction, useI18N } from '../../utils'
import { useLastRecognizedIdentity } from '../DataSource/useActivatedUI'
import { SteganographyTextPayload } from '../InjectedComponents/SteganographyTextPayload'
import type { SubmitComposition } from './CompositionUI'

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
            const decoratedText = decorateEncryptedText(encrypted, t, content.meta)

            if (encode === 'image') {
                const defaultText = t('additional_post_box__steganography_post_pre', {
                    random: new Date().toLocaleString(),
                })
                if (decoratedText !== null) {
                    await pasteImage(decoratedText.replace(encrypted, ''), encrypted, 'eth', reason)
                } else {
                    await pasteImage(defaultText, encrypted, 'v2', reason)
                }
            } else {
                pasteTextEncode(decoratedText ?? t('additional_post_box__encrypted_post_pre', { encrypted }), reason)
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

// TODO: Provide API to plugin to post-process post content,
// then we can move these -PreText's and meta readers into plugin's own context
function decorateEncryptedText(encrypted: string, t: I18NFunction, meta?: Meta) {
    const hasOfficialAccount = isTwitter(activatedSocialNetworkUI) || isFacebook(activatedSocialNetworkUI)
    const officialAccount = isTwitter(activatedSocialNetworkUI) ? t('twitter_account') : t('facebook_account')

    if (RedPacketMetadataReader(meta).ok) {
        return hasOfficialAccount
            ? t('additional_post_box__encrypted_post_pre_red_packet_twitter_official_account', {
                  encrypted,
                  account: officialAccount,
              })
            : t('additional_post_box__encrypted_post_pre_red_packet', { encrypted })
    } else if (ITO_MetadataReader(meta).ok) {
        return hasOfficialAccount
            ? t('additional_post_box__encrypted_post_pre_ito_twitter_official_account', {
                  encrypted,
                  account: officialAccount,
              })
            : t('additional_post_box__encrypted_post_pre_ito', { encrypted })
    } else if (FileInfoMetadataReader(meta).ok) {
        return hasOfficialAccount
            ? t('additional_post_box__encrypted_post_pre_file_service_twitter_official_account', {
                  encrypted,
                  account: officialAccount,
              })
            : t('additional_post_box__encrypted_post_pre_file_service', { encrypted })
    }
    return null
}
