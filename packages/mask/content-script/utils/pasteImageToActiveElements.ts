import { pasteImage } from '@masknet/injected-script'

/**
 * paste image to activeElements
 * @param image
 */

export async function pasteImageToActiveElements(image: File | Blob): Promise<void> {
    pasteImage(new Uint8Array(await image.arrayBuffer()))
}
