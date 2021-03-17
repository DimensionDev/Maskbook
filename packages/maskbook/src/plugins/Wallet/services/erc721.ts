import { createTransaction } from '../../../database/helpers/openDB'
import { createWalletDBAccess } from '../database/Wallet.db'
import { WalletMessages } from '../messages'
import { assert } from '../../../utils/utils'
import { formatChecksumAddress } from '../formatter'
import { WalletRecordIntoDB, ERC721TokenRecordIntoDB, getWalletByAddress } from './helpers'
import type { ERC721TokenDetailed } from '../../../web3/types'

export async function getERC721Tokens() {
    const t = createTransaction(await createWalletDBAccess(), 'readonly')('ERC721Token', 'Wallet')
    return t.objectStore('ERC721Token').getAll()
}

export async function addERC721Token(token: ERC721TokenDetailed) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('ERC721Token', 'Wallet')
    await t.objectStore('ERC721Token').put(
        ERC721TokenRecordIntoDB({
            ...token,
            name: token.name ?? '',
            symbol: token.symbol ?? '',
        }),
    )
    WalletMessages.events.erc721TokensUpdated.sendToAll(undefined)
}

export async function removeERC721Token(token: PartialRequired<ERC721TokenDetailed, 'address'>) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('ERC721Token', 'Wallet')
    await t.objectStore('ERC721Token').delete(formatChecksumAddress(token.address))
    WalletMessages.events.erc721TokensUpdated.sendToAll(undefined)
}

export async function trustERC721Token(address: string, token: ERC721TokenDetailed) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('ERC721Token', 'Wallet')
    const wallet = await getWalletByAddress(t, formatChecksumAddress(address))
    assert(wallet)
    let updated = false
    const tokenAddressChecksummed = formatChecksumAddress(token.address)
    const key = `${tokenAddressChecksummed}_${token.tokenId}`
    if (!wallet.erc721_token_whitelist.has(key)) {
        wallet.erc721_token_whitelist.add(key)
        updated = true
    }
    if (wallet.erc721_token_blacklist.has(key)) {
        wallet.erc721_token_blacklist.delete(key)
        updated = true
    }
    if (!updated) return
    await t.objectStore('Wallet').put(WalletRecordIntoDB(wallet))
    WalletMessages.events.walletsUpdated.sendToAll(undefined)
}

export async function blockERC721Token(
    address: string,
    token: PartialRequired<ERC721TokenDetailed, 'address' | 'tokenId'>,
) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('ERC721Token', 'Wallet')
    const wallet = await getWalletByAddress(t, formatChecksumAddress(address))
    assert(wallet)
    let updated = false
    const tokenAddressChecksummed = formatChecksumAddress(token.address)
    const key = `${tokenAddressChecksummed}_${token.tokenId}`
    if (wallet.erc721_token_whitelist.has(key)) {
        wallet.erc721_token_whitelist.delete(key)
        updated = true
    }
    if (!wallet.erc721_token_blacklist.has(key)) {
        wallet.erc721_token_blacklist.add(key)
        updated = true
    }
    if (!updated) return
    await t.objectStore('Wallet').put(WalletRecordIntoDB(wallet))
    WalletMessages.events.walletsUpdated.sendToAll(undefined)
}
