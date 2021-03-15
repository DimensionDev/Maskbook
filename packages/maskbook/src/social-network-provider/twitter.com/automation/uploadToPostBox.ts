export {}
// import { downloadUrl } from '../../../utils/utils'
// import { SocialNetworkUI, activatedSocialNetworkUI } from '../../../social-network-next'
// import Services from '../../../extension/service'
// import { encodeArrayBuffer, decodeArrayBuffer } from '../../../utils/type-transform/String-ArrayBuffer'
// import { ImagePayloadURLs } from '../../../resources/image-payload'
// import { pasteImageToCompositionDefault } from '../../../social-network-next/defaults/PasteImageToComposition'

// export const uploadToPostBoxTwitter: SocialNetworkUI.AutomationCapabilities.NativeCompositionDialog['attachImage'] = async (text, options) => {
//     const { template = 'v2' } = options
//     const lastRecognizedIdentity = activatedSocialNetworkUI.collecting.identityProvider?.lastRecognized
//     const blankImage = await downloadUrl(ImagePayloadURLs[template]).then((x) => x.arrayBuffer())
//     const secretImage = new Blob(
//         [
//             decodeArrayBuffer(
//                 await Services.Steganography.encodeImage(encodeArrayBuffer(blankImage), {
//                     text,
//                     pass: lastRecognizedIdentity?.value ? lastRecognizedIdentity.value.identifier.toText() : '',
//                     template,
//                 }),
//             ),
//         ],
//         { type: 'image/png' },
//     )
//     pasteImageToCompositionDefault(() => false)(secretImage, {
//         relatedTextPayload: options.relatedText,
//         recover: options.autoPasteFailedRecover,
//     })
// }
