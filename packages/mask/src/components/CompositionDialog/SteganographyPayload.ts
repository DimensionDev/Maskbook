import { GrayscaleAlgorithm, SteganographyPreset } from '@masknet/encryption'
import Services from '../../extension/service.js'
import { SteganographyPresetImage } from '../../resources/image-payload/index.js'
import { activatedSocialNetworkUI } from '../../social-network/index.js'
import { downloadUrl } from '../../utils/utils.js'

export async function SteganographyPayload(data: string | Uint8Array) {
    const password = activatedSocialNetworkUI.configuration.steganography?.password?.() || 'mask'
    const preset = typeof data === 'string' ? SteganographyPreset.Preset2021 : SteganographyPreset.Preset2022
    const blankImage = await downloadUrl(SteganographyPresetImage[preset]).then((x) => x.arrayBuffer())
    const secretImage = await Services.Crypto.steganographyEncodeImage(new Uint8Array(blankImage), {
        preset,
        data,
        password,
        grayscaleAlgorithm:
            activatedSocialNetworkUI.configuration.steganography?.grayscaleAlgorithm ?? GrayscaleAlgorithm.NONE,
    })
    const blob = new Blob([secretImage], { type: 'image/png' })
    return blob
}
