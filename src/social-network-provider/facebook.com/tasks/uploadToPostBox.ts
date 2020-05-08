import { SocialNetworkUI, getActivatedUI } from '../../../social-network/ui'
import { untilDocumentReady } from '../../../utils/dom'
import { getUrl, downloadUrl, pasteImageToActiveElements } from '../../../utils/utils'
import Services from '../../../extension/service'
import { decodeArrayBuffer } from '../../../utils/type-transform/String-ArrayBuffer'
import { GrayscaleAlgorithm } from 'node-stego/es/grayscale'

export async function uploadToPostBoxFacebook(
    text: string,
    options: Parameters<SocialNetworkUI['taskUploadToPostBox']>[1],
) {
    const { warningText, template = 'default' } = options
    const { currentIdentity } = getActivatedUI()
    const blankImage = await downloadUrl(getUrl(`${template === 'default' ? '' : '/wallet'}/payload-${template}.png`))
    const secretImage = new Uint8Array(
        decodeArrayBuffer(
            await Services.Steganography.encodeImage(new Uint8Array(blankImage), {
                text,
                pass: currentIdentity.value ? currentIdentity.value.identifier.toText() : '',
                template,
                // ! the color image cannot compression resistance in Facebook
                grayscaleAlgorithm: GrayscaleAlgorithm.LUMINANCE,
            }),
        ),
    )
    await pasteImageToActiveElements(secretImage)
    await untilDocumentReady()
    try {
        // Need a better way to find whether the image is pasted into
        // throw new Error('auto uploading is undefined')
    } catch {
        uploadFail()
    }

    async function uploadFail() {
        console.warn('Image not uploaded to the post box')
        if (confirm(warningText)) {
            await Services.Steganography.downloadImage(secretImage)
        }
    }
}
