import { SocialNetworkUI, getActivatedUI } from '../../../social-network/ui'
import { untilDocumentReady } from '../../../utils/dom'
import { getUrl, downloadUrl, pasteImageToActiveElements } from '../../../utils/utils'
import Services from '../../../extension/service'

export async function uploadToPostBoxFacebook(
    text: string,
    options: Parameters<SocialNetworkUI['taskUploadToPostBox']>[1],
) {
    const { warningText, template = 'default' } = options
    const { currentIdentity } = getActivatedUI()
    const blankImage = await downloadUrl(getUrl(`/maskbook-steganography-${template}.png`))
    const secretImage = await Services.Steganography.encodeImage(new Uint8Array(blankImage), {
        text,
        pass: currentIdentity.value ? currentIdentity.value.identifier.toText() : '',
        template,
    })

    const image = new Uint8Array(secretImage)
    await pasteImageToActiveElements(image)
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
            await Services.Steganography.downloadImage(image)
        }
    }
}
