import RSS3 from 'rss3-next'
import { RSS3_ENDPOINT } from '../constants'
import { personalSign } from '../../../extension/background-script/EthereumService'
import type { BoxMetadata } from '../type'

async function createRSS(address: string) {
    return new RSS3({
        endpoint: RSS3_ENDPOINT,
        address,
        sign: async (message: string) => {
            return personalSign(message, address)
        },
    })
}

export async function getMaskBoxMetadata(boxId: string, creator: string) {
    const rss = await createRSS(creator)
    const file = await rss.files.get(rss.account.address)
    if (!file) throw new Error('The account was not found.')
    const boxes = Object.getOwnPropertyDescriptor(file, '_box')?.value as Record<string, BoxMetadata> | undefined
    return boxes?.[boxId]
}
