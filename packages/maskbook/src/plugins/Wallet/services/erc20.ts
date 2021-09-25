import Fuse from 'fuse.js'
import { EthereumAddress } from 'wallet.ts'
import { createTransaction } from '../../../database/helpers/openDB'
import { createWalletDBAccess } from '../database/Wallet.db'
import { WalletMessages } from '../messages'
import { assert } from '../../../utils/utils'
import { ERC20TokenRecordIntoDB, getWalletByAddress, LegacyWalletRecordIntoDB } from './helpers'
import type { ERC20TokenRecord } from '../database/types'
import { ERC20TokenDetailed, formatEthereumAddress, isSameAddress } from '@masknet/web3-shared'
import { queryTransactionPaged } from '../../../database/helpers/pagination'

export async function getERC20TokensCount() {
    const t = createTransaction(await createWalletDBAccess(), 'readonly')('ERC20Token', 'Wallet')
    return t.objectStore('ERC20Token').count()
}

export async function getERC20Tokens() {
    const t = createTransaction(await createWalletDBAccess(), 'readonly')('ERC20Token', 'Wallet')
    return t.objectStore('ERC20Token').getAll()
}

const fuse = new Fuse([] as ERC20TokenRecord[], {
    shouldSort: true,
    threshold: 0.45,
    minMatchCharLength: 1,
    keys: [
        { name: 'name', weight: 0.8 },
        { name: 'symbol', weight: 0.2 },
    ],
})

export async function getERC20TokensPaged(index: number, count: number, query?: string) {
    const t = createTransaction(await createWalletDBAccess(), 'readonly')('ERC20Token')
    return queryTransactionPaged(t, 'ERC20Token', {
        skip: index * count,
        count,
        predicate: (record) => {
            if (!query) return true
            if (EthereumAddress.isValid(query) && !isSameAddress(query, record.address)) return false
            fuse.setCollection([record])
            return !!fuse.search(query).length
        },
    })
}

export async function addERC20Token(token: ERC20TokenDetailed) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('ERC20Token', 'Wallet')
    await t.objectStore('ERC20Token').put(
        ERC20TokenRecordIntoDB({
            ...token,
            name: token.name ?? '',
            symbol: token.symbol ?? '',
            decimals: token.decimals ?? 0,
        }),
    )
    WalletMessages.events.erc20TokensUpdated.sendToAll(undefined)
}

export async function removeERC20Token(token: PartialRequired<ERC20TokenDetailed, 'address'>) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('ERC20Token', 'Wallet')
    await t.objectStore('ERC20Token').delete(formatEthereumAddress(token.address))
    WalletMessages.events.erc20TokensUpdated.sendToAll(undefined)
}

export async function trustERC20Token(address: string, token: ERC20TokenDetailed) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('ERC20Token', 'Wallet')
    const wallet = await getWalletByAddress(t, formatEthereumAddress(address))
    assert(wallet)
    const tokenAddressChecksummed = formatEthereumAddress(token.address)
    let updated = false
    if (!wallet.erc20_token_whitelist.has(tokenAddressChecksummed)) {
        wallet.erc20_token_whitelist.add(tokenAddressChecksummed)
        updated = true
    }
    if (wallet.erc20_token_blacklist.has(tokenAddressChecksummed)) {
        wallet.erc20_token_blacklist.delete(tokenAddressChecksummed)
        updated = true
    }
    if (!updated) return
    await t.objectStore('Wallet').put(LegacyWalletRecordIntoDB(wallet))
    WalletMessages.events.walletsUpdated.sendToAll(undefined)
}

export async function blockERC20Token(address: string, token: PartialRequired<ERC20TokenDetailed, 'address'>) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('ERC20Token', 'Wallet')
    const wallet = await getWalletByAddress(t, formatEthereumAddress(address))
    assert(wallet)
    let updated = false
    const tokenAddressChecksummed = formatEthereumAddress(token.address)
    if (wallet.erc20_token_whitelist.has(tokenAddressChecksummed)) {
        wallet.erc20_token_whitelist.delete(tokenAddressChecksummed)
        updated = true
    }
    if (!wallet.erc20_token_blacklist.has(tokenAddressChecksummed)) {
        wallet.erc20_token_blacklist.add(tokenAddressChecksummed)
        updated = true
    }
    if (!updated) return
    await t.objectStore('Wallet').put(LegacyWalletRecordIntoDB(wallet))
    WalletMessages.events.walletsUpdated.sendToAll(undefined)
}
