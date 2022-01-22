import { blobToArrayBuffer } from '@dimensiondev/kit'
import { GrayscaleAlgorithm, type ImageTemplateTypes } from '@masknet/encryption'
import Services from '../../extension/service'
import { ImagePayloadURLs } from '../../resources/image-payload'
import { activatedSocialNetworkUI } from '../../social-network'
import { downloadUrl } from '../../utils/utils'

export async function SteganographyTextPayload(template: ImageTemplateTypes, text: string) {
    const pass = activatedSocialNetworkUI.configuration.steganography?.password?.() || 'mask'
    const blankImage = await downloadUrl(ImagePayloadURLs[template]).then(blobToArrayBuffer)
    const secretImage = await Services.Crypto.steganographyEncodeImage(new Uint8Array(blankImage), {
        text,
        pass,
        template,
        grayscaleAlgorithm:
            activatedSocialNetworkUI.configuration.steganography?.grayscaleAlgorithm ?? GrayscaleAlgorithm.NONE,
    })

    return new Blob([secretImage], { type: 'image/png' })
}
