import type { ImageTemplateTypes } from '@masknet/encryption'

export const ImagePayloadURLs: Readonly<Record<ImageTemplateTypes, string>> = {
    v2: new URL('./normal/payload-v2.png', import.meta.url).toString(),
}
