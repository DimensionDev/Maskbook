import type { SiteAdaptorUI } from '@masknet/types'
import { msg } from '@lingui/core/macro'
import { i18n } from '@lingui/core'

export const i18NOverwriteTwitter: SiteAdaptorUI.Customization.I18NOverwrite = {
    postBoxEncryptedTextWrapper(encrypted: string) {
        return (
            i18n._(msg`This tweet is encrypted with #mask_io (@realMaskNetwork). 📪🔑`) +
            '\n\n' +
            i18n._(
                msg`🎭 🎭🎭 Tired of plaintext? Try to send encrypted messages to your friends. Install ${encrypted} to send your first encrypted tweet.`,
            )
        )
    },
}
