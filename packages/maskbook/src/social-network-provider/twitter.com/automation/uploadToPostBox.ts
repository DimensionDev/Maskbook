import { downloadUrl } from '../../../utils/utils'
import { SocialNetworkUI, getActivatedUI } from '../../../social-network/ui'
import Services from '../../../extension/service'
import { encodeArrayBuffer, decodeArrayBuffer } from '../../../utils/type-transform/String-ArrayBuffer'
import { ImagePayloadURLs } from '../../../resources/image-payload'
import { pasteImageToCompositionDefault } from '../../../social-network-next/defaults/pasteImageToComposition'

export const uploadToPostBoxTwitter: SocialNetworkUI['taskUploadToPostBox'] = async (text, options) => {
    const { template = 'v2' } = options
    const { lastRecognizedIdentity } = getActivatedUI()
    const blankImage = await downloadUrl(ImagePayloadURLs[template]).then((x) => x.arrayBuffer())
    const secretImage = new Blob(
        [
            decodeArrayBuffer(
                await Services.Steganography.encodeImage(encodeArrayBuffer(blankImage), {
                    text,
                    pass: lastRecognizedIdentity.value ? lastRecognizedIdentity.value.identifier.toText() : '',
                    template,
                }),
            ),
        ],
        { type: 'image/png' },
    )
    pasteImageToCompositionDefault(() => false)(secretImage, {
        relatedTextPayload: options.relatedText,
        recover: options.autoPasteFailedRecover,
    })
}
