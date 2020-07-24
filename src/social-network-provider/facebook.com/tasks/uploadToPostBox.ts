import { SocialNetworkUI, getActivatedUI } from '../../../social-network/ui'
import { untilDocumentReady } from '../../../utils/dom'
import { getUrl, downloadUrl, pasteImageToActiveElements, sleep } from '../../../utils/utils'
import Services from '../../../extension/service'
import { decodeArrayBuffer, encodeArrayBuffer } from '../../../utils/type-transform/String-ArrayBuffer'
import { GrayscaleAlgorithm } from '@dimensiondev/stego-js/cjs/grayscale'

export async function uploadToPostBoxFacebook(
    text: string,
    options: Parameters<SocialNetworkUI['taskUploadToPostBox']>[1],
) {
    const { warningText, template = 'v2' } = options
    const { lastRecognizedIdentity } = getActivatedUI()
    const blankImage = await downloadUrl(
        getUrl(`${template === 'v2' ? '/image-payload' : '/wallet'}/payload-${template}.png`),
    )
    const secretImage = new Uint8Array(
        decodeArrayBuffer(
            await Services.Steganography.encodeImage(new Uint8Array(blankImage), {
                text,
                pass: lastRecognizedIdentity.value ? lastRecognizedIdentity.value.identifier.toText() : '',
                template,
                // ! the color image cannot pass the compression resistance in Facebook
                grayscaleAlgorithm: GrayscaleAlgorithm.LUMINANCE,
            }),
        ),
    )
    pasteImageToActiveElements(secretImage)
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

export async function uploadShuffleToPostBoxFacebook(
    image: ArrayBuffer,
    seed: string,
    options: Parameters<SocialNetworkUI['taskUploadToPostBox']>[1],
) {
    const { warningText } = options
    const shuffledImage = new Uint8Array(
        decodeArrayBuffer(
            await Services.ImageShuffle.shuffle(encodeArrayBuffer(image), {
                seed,
            }),
        ),
    )

    // ! race conditions, thus sleep
    await sleep(500)
    pasteImageToActiveElements(shuffledImage)
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
            await Services.Steganography.downloadImage(shuffledImage)
        }
    }
}
