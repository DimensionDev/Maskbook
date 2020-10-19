import { createTransaction } from '../../../database/helpers/openDB'
import { createWalletDBAccess } from '../database/Wallet.db'
import { PluginMessageCenter } from '../../PluginMessages'
import { assert } from '../../../utils/utils'
import type { Token } from '../../../web3/types'
import { formatChecksumAddress } from '../formatter'
import { WalletRecordIntoDB, ERC20TokenRecordIntoDB, getWalletByAddress } from './helpers'

export async function getTokens() {
    const t = createTransaction(await createWalletDBAccess(), 'readonly')('ERC20Token', 'Wallet')
    return t.objectStore('ERC20Token').getAll()
}

export async function addERC20Token(token: Token) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('ERC20Token', 'Wallet')
    await t.objectStore('ERC20Token').put(ERC20TokenRecordIntoDB(token))
    PluginMessageCenter.emit('maskbook.tokens.update', undefined)
}

export async function removeERC20Token(token: PartialRequired<Token, 'address'>) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('ERC20Token', 'Wallet')
    await t.objectStore('ERC20Token').delete(formatChecksumAddress(token.address))
    PluginMessageCenter.emit('maskbook.tokens.update', undefined)
}

export async function trustERC20Token(address: string, token: Token) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('ERC20Token', 'Wallet')
    const wallet = await getWalletByAddress(t, formatChecksumAddress(address))
    assert(wallet)
    const tokenAddressChecksummed = formatChecksumAddress(token.address)
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
    await t.objectStore('Wallet').put(WalletRecordIntoDB(wallet))
    PluginMessageCenter.emit('maskbook.wallets.update', undefined)
}

export async function blockERC20Token(address: string, token: PartialRequired<Token, 'address'>) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('ERC20Token', 'Wallet')
    const wallet = await getWalletByAddress(t, formatChecksumAddress(address))
    assert(wallet)
    let updated = false
    const tokenAddressChecksummed = formatChecksumAddress(token.address)
    if (wallet.erc20_token_whitelist.has(tokenAddressChecksummed)) {
        wallet.erc20_token_whitelist.delete(tokenAddressChecksummed)
        updated = true
    }
    if (!wallet.erc20_token_blacklist.has(tokenAddressChecksummed)) {
        wallet.erc20_token_blacklist.add(tokenAddressChecksummed)
        updated = true
    }
    if (!updated) return
    await t.objectStore('Wallet').put(WalletRecordIntoDB(wallet))
    PluginMessageCenter.emit('maskbook.wallets.update', undefined)
}
