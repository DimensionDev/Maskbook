import { SocialNetworkUI, getActivatedUI } from '../../../social-network/ui'
import { untilDocumentReady } from '../../../utils/dom'
import { getUrl, downloadUrl } from '../../../utils/utils'
import Services from '../../../extension/service'

export async function uploadToPostBoxFacebook(
    text: string,
    options: Parameters<SocialNetworkUI['taskPasteIntoPostBox']>[1],
) {
    const { warningText } = options
    const { currentIdentity } = getActivatedUI()
    const blankImage = await downloadUrl(getUrl('/maskbook-steganography.png'))
    const secretImage = await Services.Steganography.encodeImage(new Uint8Array(blankImage), {
        text,
        pass: currentIdentity.value ? currentIdentity.value.identifier.toText() : '',
    })

    await untilDocumentReady()
    try {
        // TODO: implement auto uploading
        throw new Error('auto uploading is undefined')
    } catch {
        uploadFail()
    }

    async function uploadFail() {
        console.warn('Image not uploaded to the post box')
        if (confirm(warningText)) {
            await Services.Steganography.downloadImage(new Uint8Array(secretImage))
        }
    }
}
