export type ImageTemplateTypes = 'v1' | 'v2' | 'v3' | 'v4' | 'eth' | 'dai' | 'okb'
export const ImagePayloadURLs: Readonly<Record<ImageTemplateTypes, string>> = {
    v1: new URL('./normal/payload-v1.png', import.meta.url).toString(),
    v2: new URL('./normal/payload-v2.png', import.meta.url).toString(),
    v3: new URL('./plugin/elec2020.png', import.meta.url).toString(),
    v4: new URL('./normal/payload-v4.png', import.meta.url).toString(),
    okb: new URL('./wallet/payload-okb.png', import.meta.url).toString(),
    dai: new URL('./wallet/payload-dai.png', import.meta.url).toString(),
    eth: new URL('./wallet/payload-eth.png', import.meta.url).toString(),
}
