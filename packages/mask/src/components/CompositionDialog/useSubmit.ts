import { ProfileIdentifier } from '@masknet/shared-base'
import { useCallback } from 'react'
import Services from '../../extension/service'
import { RedPacketMetadataReader } from '../../plugins/RedPacket/SNSAdaptor/helpers'
import type { ImageTemplateTypes } from '../../resources/image-payload'
import { activatedSocialNetworkUI, globalUIState } from '../../social-network'
import { isTwitter } from '../../social-network-adaptor/twitter.com/base'
import { useI18N } from '../../utils'
import { SteganographyTextPayload } from '../InjectedComponents/SteganographyTextPayload'
import type { SubmitComposition } from './CompositionUI'
import { unreachable } from '@dimensiondev/kit'
import { useLastRecognizedIdentity } from '../DataSource/useActivatedUI'
import { isFacebook } from '../../social-network-adaptor/facebook.com/base'

export function useSubmit(onClose: () => void) {
    const { t } = useI18N()
    const whoAmI = useLastRecognizedIdentity()

    return useCallback(
        async (info: SubmitComposition) => {
            const { content, encode, target } = info

            const network = activatedSocialNetworkUI.networkIdentifier
            const currentProfile = new ProfileIdentifier(
                network,
                ProfileIdentifier.getUserName(globalUIState.profiles.value[0].identifier) ||
                    unreachable('Cannot figure out current profile' as never),
            )

            const [encrypted, token] = await Services.Crypto.encryptTo(
                content,
                target === 'Everyone' ? [] : target.map((x) => x.identifier),
                whoAmI?.identifier ?? currentProfile,
                target === 'Everyone',
            )
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
                    await pasteImage(redPacketPreText.replace(encrypted, '') ?? defaultText, encrypted, 'eth')
                } else {
                    await pasteImage(defaultText, encrypted, 'v2')
                }
            } else {
                pasteTextEncode(
                    (redPacketMetadata.ok ? redPacketPreText : null) ??
                        t('additional_post_box__encrypted_post_pre', { encrypted }),
                )
            }
            // This step write data on gun. There is nothing to write if it shared with public
            if (target !== 'Everyone') Services.Crypto.publishPostAESKey(token)
            onClose()
        },
        [t, whoAmI, onClose],
    )
}

function pasteTextEncode(text: string) {
    activatedSocialNetworkUI.automation.nativeCompositionDialog?.appendText?.(text, {
        recover: true,
    })
}
async function pasteImage(relatedTextPayload: string, encrypted: string, template: ImageTemplateTypes) {
    const img = await SteganographyTextPayload(template, encrypted)
    // Don't await this, otherwise the dialog won't disappear
    activatedSocialNetworkUI.automation.nativeCompositionDialog!.attachImage!(img, {
        recover: true,
        relatedTextPayload,
    })
}
