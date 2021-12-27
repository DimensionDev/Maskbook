import Web3 from 'web3'
import RSS3 from 'rss3-next'
import { isSameAddress } from '@masknet/web3-shared-evm'
import { personalSign } from '../../../extension/background-script/EthereumService'
import type { EssayRSSNode, PetMetaDB } from '../types'
import { RSS3_APP } from '../../Avatar/constants'

export async function createRSS3(address: string) {
    return new RSS3({
        endpoint: RSS3_APP,
        address,
        sign: async (message: string) => {
            return personalSign(message, address)
        },
    })
}

const cache = new Map<string, Promise<PetMetaDB | undefined>>()

export async function getCustomEssayFromRSS(address: string) {
    let f = cache.get(address)
    if (!f) {
        f = _getCustomEssayFromRSS(address)
        cache.set(address, f)
    }
    const essay = await f
    return essay
}

async function _getCustomEssayFromRSS(address: string): Promise<PetMetaDB | undefined> {
    const rss = await createRSS3(address)
    const file = await rss.files.get(rss.account.address)
    const essay = Object.getOwnPropertyDescriptor(file, '_pet')
    if (!essay?.value) return
    const data = essay.value as EssayRSSNode

    const web3 = new Web3()
    const result = web3.eth.accounts.recover(data.essay.userId, data.signature)
    if (!isSameAddress(result, address)) return
    return data.essay
}

export async function saveCustomEssayToRSS(address: string, essay: PetMetaDB, signature: string) {
    const rss = await createRSS3(address)
    if (!rss) return

    const file = await rss.files.get(rss.account.address)
    if (!file) throw new Error('The account was not found.')

    rss.files.set(
        Object.assign(file, {
            _pet: {
                signature,
                essay,
            },
        }),
    )
    await rss.files.sync()
    if (cache.has(address)) cache.delete(address)
    return essay
}

export async function getRSSNode(address: string) {
    const rss = await createRSS3(address)
    const file = await rss.files.get(rss.account.address)
    const essay = Object.getOwnPropertyDescriptor(file, '_pet')
    if (!essay?.value) return
    return file
}
