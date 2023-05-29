import { socialNetworkEncoder } from '@masknet/encryption'
import { PluginID, type ProfileIdentifier, SOCIAL_MEDIA_NAME } from '@masknet/shared-base'
import type { Meta } from '@masknet/typed-message'
import { useCallback } from 'react'
import Services from '../../extension/service.js'
import { isFacebook } from '../../social-network-adaptor/facebook.com/base.js'
import { isTwitter } from '../../social-network-adaptor/twitter.com/base.js'
import { activatedSocialNetworkUI, globalUIState } from '../../social-network/index.js'
import { type I18NFunction, useI18N } from '../../utils/index.js'
import { useLastRecognizedIdentity } from '../DataSource/useActivatedUI.js'
import type { SubmitComposition } from './CompositionUI.js'
import { SteganographyPayload } from './SteganographyPayload.js'

export function useSubmit(onClose: () => void, reason: 'timeline' | 'popup' | 'reply') {
    const { t: originalTran } = useI18N()
    const t: typeof originalTran = useCallback(
        (key, options = {}) => {
            if (typeof options === 'string') return t(key, options)
            return originalTran(key, { interpolation: { escapeValue: false }, ...options })
        },
        [originalTran],
    )

    const lastRecognizedIdentity = useLastRecognizedIdentity()

    return useCallback(
        async (info: SubmitComposition) => {
            const { content, encode, target } = info
            const fallbackProfile: ProfileIdentifier | undefined = globalUIState.profiles.value[0]?.identifier
            if (encode === 'image' && !lastRecognizedIdentity) throw new Error('No Current Profile')

            // rawEncrypted is either string or Uint8Array
            // string is the old format, Uint8Array is the new format.
            const rawEncrypted = await Services.Crypto.encryptTo(
                info.version,
                content,
                target,
                lastRecognizedIdentity?.identifier ?? fallbackProfile,
                activatedSocialNetworkUI.encryptionNetwork,
            )
            // Since we cannot directly send binary on the SNS, we need to encode it into a string.
            const encrypted = socialNetworkEncoder(activatedSocialNetworkUI.encryptionNetwork, rawEncrypted)

            if (encode === 'image') {
                const decoratedText = decorateEncryptedText('', t, content.meta)
                const defaultText = t('additional_post_box__encrypted_post_pre', {
                    encrypted: 'https://mask.io/',
                })
                await pasteImage(
                    decoratedText || defaultText,
                    // We can send raw binary through the image, but for the text we still use the old way.
                    // For text, it must send the text _after_ socialNetworkEncoder, otherwise it will break backward compatibility.
                    typeof rawEncrypted === 'string' ? encrypted : rawEncrypted,
                    reason,
                )
            } else {
                const decoratedText = decorateEncryptedText(encrypted, t, content.meta)
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
    encrypted: string | Uint8Array,
    reason: 'timeline' | 'popup' | 'reply',
) {
    const img = await SteganographyPayload(encrypted)
    // Don't await this, otherwise the dialog won't disappear
    activatedSocialNetworkUI.automation.nativeCompositionDialog!.attachImage!(img, {
        recover: true,
        relatedTextPayload,
        reason,
    })
}

// TODO: Provide API to plugin to post-process post content,
// then we can move these -PreText's and meta readers into plugin's own context
function decorateEncryptedText(encrypted: string, t: I18NFunction, meta?: Meta): string | null {
    const hasOfficialAccount = isTwitter(activatedSocialNetworkUI) || isFacebook(activatedSocialNetworkUI)
    const officialAccount = isTwitter(activatedSocialNetworkUI) ? t('twitter_account') : t('facebook_account')

    // Note: since this is in the composition stage, we can assume plugins don't insert old version of meta.
    if (meta?.has(`${PluginID.RedPacket}:1`) || meta?.has(`${PluginID.RedPacket}_nft:1`)) {
        return hasOfficialAccount
            ? t('additional_post_box__encrypted_post_pre_red_packet_sns_official_account', {
                  encrypted,
                  account: officialAccount,
              })
            : t('additional_post_box__encrypted_post_pre_red_packet', { encrypted })
    } else if (meta?.has(`${PluginID.ITO}:2`)) {
        return hasOfficialAccount
            ? t('additional_post_box__encrypted_post_pre_ito_sns_official_account', {
                  encrypted,
                  account: officialAccount,
                  sns: SOCIAL_MEDIA_NAME[activatedSocialNetworkUI.networkIdentifier],
              })
            : t('additional_post_box__encrypted_post_pre_ito', {
                  encrypted,
                  sns: SOCIAL_MEDIA_NAME[activatedSocialNetworkUI.networkIdentifier],
              })
    } else if (meta?.has(`${PluginID.FileService}:3`)) {
        return hasOfficialAccount
            ? t('additional_post_box__encrypted_post_pre_file_service_sns_official_account', {
                  encrypted,
                  account: officialAccount,
                  sns: SOCIAL_MEDIA_NAME[activatedSocialNetworkUI.networkIdentifier],
              })
            : t('additional_post_box__encrypted_post_pre_file_service', {
                  encrypted,
                  sns: SOCIAL_MEDIA_NAME[activatedSocialNetworkUI.networkIdentifier],
              })
    }
    return null
}
