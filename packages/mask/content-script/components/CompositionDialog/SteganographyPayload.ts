import { GrayscaleAlgorithm, SteganographyPreset } from '@masknet/encryption'
import { SteganographyPresetImage } from '../../resources/image-payload/index.js'
import { activatedSiteAdaptorUI } from '../../site-adaptor-infra/index.js'
import Services from '#services'
import { downloadUrl } from '../../utils/downloadUrl.js'

export async function SteganographyPayload(data: string | Uint8Array) {
    const password = activatedSiteAdaptorUI!.configuration.steganography?.password?.() || 'mask'
    const preset = typeof data === 'string' ? SteganographyPreset.Preset2022 : SteganographyPreset.Preset2023
    const blankImageUrl = SteganographyPresetImage[preset]
    if (!blankImageUrl) throw new Error('No preset image found.')
    const blankImage = await downloadUrl(blankImageUrl).then((x) => x.arrayBuffer())
    const secretImage = await Services.Crypto.steganographyEncodeImage(new Uint8Array(blankImage), {
        preset,
        data,
        password,
        grayscaleAlgorithm:
            activatedSiteAdaptorUI!.configuration.steganography?.grayscaleAlgorithm ?? GrayscaleAlgorithm.NONE,
    })
    const blob = new Blob([secretImage], { type: 'image/png' })
    return blob
}
