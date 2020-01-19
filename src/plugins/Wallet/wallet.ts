import { createTransaction, IDBPSafeTransaction, createDBAccess } from '../../database/helpers/openDB'
import { createWalletDBAccess, WalletDB } from '../../database/Plugins/Wallet/Wallet.db'
import { WalletRecord } from '../../database/Plugins/Wallet/types'
import uuid from 'uuid/v4'
import { mockWalletAPI } from './mock'
import { assert } from './red-packet-fsm'
import { PluginMessageCenter } from '../PluginMessages'
import { HDKey, EthereumAddress } from 'wallet.ts'
import * as bip39 from 'bip39'
import { encodeArrayBuffer } from '../../utils/type-transform/String-ArrayBuffer'
import { walletAPI } from './real'

// Private key at m/44'/coinType'/account'/change/addressIndex
// coinType = ether
const path = "m/44'/60'/0'/0/0"
export function getWalletProvider() {
    return walletAPI
}
export async function getWallets() {
    const t = createTransaction(await createWalletDBAccess(), 'readonly')('Wallet')
    return t.objectStore('Wallet').getAll()
}

export async function importNewWallet(
    rec: Omit<WalletRecord, 'id' | 'address' | 'eth_balance' | '_data_source_' | 'erc20_token_balance'>,
) {
    const mnemonicWord = rec.mnemonic
    const seed = await bip39.mnemonicToSeed(mnemonicWord.join(' '), rec.passphrase)
    const masterKey = HDKey.parseMasterSeed(seed)
    const extendedPrivateKey = masterKey.derive(path).extendedPrivateKey!
    const childKey = HDKey.parseExtendedKey(extendedPrivateKey)

    const wallet = childKey.derive('0')
    const walletPrivateKey = wallet.privateKey
    const walletPublicKey = wallet.publicKey
    const address = EthereumAddress.from(walletPublicKey).address

    console.log(encodeArrayBuffer(walletPrivateKey!))

    const newLocal: WalletRecord = {
        ...rec,
        address,
        erc20_token_balance: new Map(),
        _data_source_: getWalletProvider().dataSource,
    }
    {
        const t = createTransaction(await createWalletDBAccess(), 'readwrite')('Wallet')
        t.objectStore('Wallet').add(newLocal)
    }
    getWalletProvider().watchWalletBalance(newLocal.address)
    PluginMessageCenter.emit('maskbook.wallets.update', undefined)
}

export async function onWalletBalanceUpdated(address: string, newBalance: bigint) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('Wallet')
    const wallet = await getWalletByAddress(t, address)
    wallet.eth_balance = newBalance
    t.objectStore('Wallet').put(wallet)
    PluginMessageCenter.emit('maskbook.wallets.update', undefined)
}

export async function removeWallet(id: string) {
    throw new Error('Not implemented')
}

export async function walletSyncInit() {
    const t = createTransaction(await createWalletDBAccess(), 'readonly')('Wallet')
    const wallets = t.objectStore('Wallet').getAll()
    ;(await wallets).forEach(x => {
        getWalletProvider().watchWalletBalance(x.address)
    })
}

setTimeout(() => {
    walletSyncInit()
}, 1000)

async function getWalletByAddress(t: IDBPSafeTransaction<WalletDB, ['Wallet'], 'readonly'>, address: string) {
    const rec = await t.objectStore('Wallet').get(address)
    assert(rec)
    return rec
}
