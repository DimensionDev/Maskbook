import { ProfileIdentifier } from '@masknet/shared-base'
import { EthereumTokenType, isDAI, isOKB } from '@masknet/web3-shared'
import { useCallback } from 'react'
import Services from '../../extension/service'
import { RedPacketMetadataReader } from '../../plugins/RedPacket/SNSAdaptor/helpers'
import type { ImageTemplateTypes } from '../../resources/image-payload'
import { activatedSocialNetworkUI, globalUIState } from '../../social-network'
import { isTwitter } from '../../social-network-adaptor/twitter.com/base'
import { i18n, useI18N } from '../../utils'
import { SteganographyTextPayload } from '../InjectedComponents/SteganographyTextPayload'
import type { SubmitComposition } from './CompositionUI'
import { unreachable } from '@dimensiondev/kit'
import { useLastRecognizedIdentity } from '../DataSource/useActivatedUI'

export function useSubmit(onClose: () => void) {
    const { t } = useI18N()
    const whoAmI = useLastRecognizedIdentity()

    const onRequestPost = useCallback(
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
            const redPacketPreText = isTwitter(activatedSocialNetworkUI)
                ? t('additional_post_box__encrypted_post_pre_red_packet_twitter', { encrypted })
                : t('additional_post_box__encrypted_post_pre_red_packet', { encrypted })

            // TODO: move into the plugin system
            const redPacketMetadata = RedPacketMetadataReader(content.meta)
            if (encode === 'image') {
                if (redPacketMetadata.ok) {
                    const isErc20 =
                        redPacketMetadata.val?.token && redPacketMetadata.val.token_type === EthereumTokenType.ERC20
                    const isDai = isErc20 && isDAI(redPacketMetadata.val.token?.address ?? '')
                    const isOkb = isErc20 && isOKB(redPacketMetadata.val.token?.address ?? '')
                    const template: ImageTemplateTypes = isDai ? 'dai' : isOkb ? 'okb' : 'eth'
                    const text = redPacketPreText.replace(encrypted, '')
                    await pasteImage(encrypted, template, text)
                } else {
                    await pasteImage(encrypted, 'v2', null)
                }
            } else {
                pasteTextEncode(encrypted, redPacketMetadata.ok ? redPacketPreText : null)
            }
            // This step write data on gun. There is nothing to write if it shared with public
            if (target !== 'Everyone') Services.Crypto.publishPostAESKey(token)
            onClose()
        },
        [t, onClose],
    )
    return onRequestPost
}

function pasteTextEncode(encrypted: string, text: string | null) {
    const defaultText = i18n.t('additional_post_box__encrypted_post_pre', { encrypted })

    activatedSocialNetworkUI.automation.nativeCompositionDialog?.appendText?.(text ?? defaultText, {
        recover: true,
    })
}
async function pasteImage(encrypted: string, template: ImageTemplateTypes, text: string | null) {
    const defaultText = i18n.t('additional_post_box__steganography_post_pre', {
        random: new Date().toLocaleString(),
    })
    const img = await SteganographyTextPayload(template, encrypted)
    // Don't await this, otherwise the dialog won't disappear
    activatedSocialNetworkUI.automation.nativeCompositionDialog!.attachImage!(img, {
        recover: true,
        relatedTextPayload: text ?? defaultText,
    })
}
