export { }
// import { SocialNetworkUI, activatedSocialNetworkUI } from '../../../social-network-next'
// import { downloadUrl } from '../../../utils/utils'
// import Services from '../../../extension/service'
// import { decodeArrayBuffer } from '../../../utils/type-transform/String-ArrayBuffer'
// import { GrayscaleAlgorithm } from '@dimensiondev/stego-js/cjs/grayscale'
// import { ImagePayloadURLs } from '../../../resources/image-payload'
// import { pasteImageToCompositionDefault } from '../../../social-network-next/defaults/PasteImageToComposition'

// export async function uploadToPostBoxFacebook(
//     text: string,
//     options: Parameters<SocialNetworkUI['taskUploadToPostBox']>[1],
// ) {
//     const { autoPasteFailedRecover, relatedText, template = 'v2' } = options
//     const { lastRecognizedIdentity } = activatedSocialNetworkUI
//     const blankImage = await downloadUrl(ImagePayloadURLs[template]).then((x) => x.arrayBuffer())
//     const secretImage = new Uint8Array(
//         decodeArrayBuffer(
//             await Services.Steganography.encodeImage(new Uint8Array(blankImage), {
//                 text,
//                 pass: lastRecognizedIdentity.value ? lastRecognizedIdentity.value.identifier.toText() : '',
//                 template,
//                 // ! the color image cannot compression resistance in Facebook
//                 grayscaleAlgorithm: GrayscaleAlgorithm.LUMINANCE,
//             }),
//         ),
//     )
//     const blob = new Blob([secretImage], { type: 'image/png' })
//     // TODO: detect if paste has succeed
//     await pasteImageToCompositionDefault(() => false)(blob, {
//         recover: autoPasteFailedRecover,
//         relatedTextPayload: relatedText,
//     })
// }
