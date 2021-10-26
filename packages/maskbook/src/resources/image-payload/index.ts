export type ImageTemplateTypes = 'v2' | 'eth'
export const ImagePayloadURLs: Readonly<Record<ImageTemplateTypes, string>> = {
    v2: new URL('./normal/payload-v2.png', import.meta.url).toString(),
    eth: new URL('./wallet/payload-eth.png', import.meta.url).toString(),
}
