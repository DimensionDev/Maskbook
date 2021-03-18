import { decodeArrayBuffer } from '@dimensiondev/kit'
import Services from '../../extension/service'
import { ImageTemplateTypes, ImagePayloadURLs } from '../../resources/image-payload'
import { activatedSocialNetworkUI } from '../../social-network'
import { downloadUrl } from '../../utils/utils'

export async function SteganographyTextPayload(template: ImageTemplateTypes, text: string) {
    const pass = activatedSocialNetworkUI.configuration.steganography?.password?.() || 'mask'
    const blankImage = await downloadUrl(ImagePayloadURLs[template]).then((x) => x.arrayBuffer())
    const secretImage = new Uint8Array(
        decodeArrayBuffer(
            await Services.Steganography.encodeImage(new Uint8Array(blankImage), {
                text,
                pass,
                template,
                grayscaleAlgorithm: activatedSocialNetworkUI.configuration.steganography?.grayscaleAlgorithm,
            }),
        ),
    )
    const blob = new Blob([secretImage], { type: 'image/png' })
    return blob
}
