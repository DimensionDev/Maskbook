import { AlgorithmVersion, GrayscaleAlgorithm } from '@masknet/encryption'
import Services from '../../extension/service.js'
import { ImagePayloadURL } from '../../resources/image-payload/index.js'
import { activatedSocialNetworkUI } from '../../social-network/index.js'
import { downloadUrl } from '../../utils/utils.js'

export async function SteganographyTextPayload(text: string) {
    const pass = activatedSocialNetworkUI.configuration.steganography?.password?.() || 'mask'
    const blankImage = await downloadUrl(ImagePayloadURL).then((x) => x.arrayBuffer())
    const secretImage = await Services.Crypto.steganographyEncodeImage(new Uint8Array(blankImage), {
        text,
        pass,
        grayscaleAlgorithm:
            activatedSocialNetworkUI.configuration.steganography?.grayscaleAlgorithm ?? GrayscaleAlgorithm.NONE,
        version: AlgorithmVersion.V1,
    })
    const blob = new Blob([secretImage], { type: 'image/png' })
    return blob
}
