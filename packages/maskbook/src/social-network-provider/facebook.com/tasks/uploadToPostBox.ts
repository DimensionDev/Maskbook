import { SocialNetworkUI, getActivatedUI } from '../../../social-network/ui'
import { untilDocumentReady } from '../../../utils/dom'
import { getUrl, downloadUrl, pasteImageToActiveElements } from '../../../utils/utils'
import Services from '../../../extension/service'
import { decodeArrayBuffer } from '../../../utils/type-transform/String-ArrayBuffer'
import { GrayscaleAlgorithm } from '@dimensiondev/stego-js'
import { MaskMessage } from '../../../utils/messages'

export async function uploadToPostBoxFacebook(
    text: string,
    options: Parameters<SocialNetworkUI['taskUploadToPostBox']>[1],
) {
    const { autoPasteFailedRecover, relatedText, template = 'v2' } = options
    const { lastRecognizedIdentity } = getActivatedUI()
    const blankImage = await downloadUrl(
        getUrl(
            `${
                template === 'v2' ? '/image-payload' : template === 'v3' ? '/election-2020' : '/wallet'
            }/payload-${template}.png`,
        ),
    ).then((x) => x.arrayBuffer())
    const secretImage = new Uint8Array(
        decodeArrayBuffer(
            await Services.Steganography.encodeImage(new Uint8Array(blankImage), {
                text,
                pass: lastRecognizedIdentity.value ? lastRecognizedIdentity.value.identifier.toText() : '',
                template,
                // ! the color image cannot compression resistance in Facebook
                grayscaleAlgorithm: GrayscaleAlgorithm.LUMINANCE,
            }),
        ),
    )
    pasteImageToActiveElements(secretImage)
    await untilDocumentReady()
    // TODO: Need a better way to find whether the image is pasted into
    uploadFail()

    async function uploadFail() {
        if (autoPasteFailedRecover) {
            const blob = new Blob([secretImage], { type: 'image/png' })
            MaskMessage.events.autoPasteFailed.sendToLocal({ text: relatedText, image: blob })
        }
    }
}
