import { downloadUrl, pasteImageToActiveElements } from '../../../utils/utils'
import { SocialNetworkUI, getActivatedUI } from '../../../social-network/ui'
import { untilDocumentReady } from '../../../utils/dom'
import Services from '../../../extension/service'
import { encodeArrayBuffer, decodeArrayBuffer } from '../../../utils/type-transform/String-ArrayBuffer'
import { MaskMessage } from '../../../utils/messages'
import { ImagePayloadURLs } from '../../../resources/image-payload'

export const uploadToPostBoxTwitter: SocialNetworkUI['taskUploadToPostBox'] = async (text, options) => {
    const { template = 'v2', autoPasteFailedRecover, relatedText } = options
    const { lastRecognizedIdentity } = getActivatedUI()
    const blankImage = await downloadUrl(ImagePayloadURLs[template]).then((x) => x.arrayBuffer())
    const secretImage = new Uint8Array(
        decodeArrayBuffer(
            await Services.Steganography.encodeImage(encodeArrayBuffer(blankImage), {
                text,
                pass: lastRecognizedIdentity.value ? lastRecognizedIdentity.value.identifier.toText() : '',
                template,
            }),
        ),
    )
    pasteImageToActiveElements(secretImage)
    await untilDocumentReady()
    // TODO: Need a better way to find whether the image is pasted into
    uploadFail()

    async function uploadFail() {
        if (autoPasteFailedRecover) {
            MaskMessage.events.autoPasteFailed.sendToLocal({
                text: relatedText,
                image: new Blob([secretImage], { type: 'image/png' }),
            })
        }
    }
}
