import { RSS3 } from '@masknet/web3-providers'
import type { BoxMetadata } from '../type.js'

export async function getMaskBoxMetadata(boxId: string, creator: string) {
    const rss3 = RSS3.createRSS3(creator)
    const file = await rss3.files.get(rss3.account.address)
    if (!file) throw new Error('The account was not found.')
    const boxes = Object.getOwnPropertyDescriptor(file, '_box')?.value as Record<string, BoxMetadata> | undefined
    return boxes?.[boxId]
}
