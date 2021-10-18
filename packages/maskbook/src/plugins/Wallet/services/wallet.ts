import * as bip39 from 'bip39'
import { EthereumAddress, HDKey } from 'wallet.ts'
import { BigNumber } from 'bignumber.js'
import { ec as EC } from 'elliptic'
import { first } from 'lodash-es'
import { createTransaction } from '../../../database/helpers/openDB'
import { createWalletDBAccess } from '../database/Wallet.db'
import type { WalletRecord } from '../database/types'
import { WalletMessages } from '../messages'
import { assert, buf2hex, hex2buf } from '../../../utils/utils'
import { currySameAddress, formatEthereumAddress, ProviderType, resolveProviderName } from '@masknet/web3-shared-evm'
import { getWalletByAddress, WalletRecordIntoDB, WalletRecordOutDB } from './helpers'
import { currentAccountSettings, currentProviderSettings } from '../settings'
import { HD_PATH_WITHOUT_INDEX_ETHEREUM } from '../constants'
import { updateAccount } from './account'
import { hasNativeAPI } from '../../../utils/native-rpc'
import { getAccounts } from '../../../extension/background-script/EthereumService'

function sortWallet(a: WalletRecord, b: WalletRecord) {
    const address = currentAccountSettings.value
    if (a.address === address) return -1
    if (b.address === address) return 1
    if (a.updatedAt > b.updatedAt) return -1
    if (a.updatedAt < b.updatedAt) return 1
    if (a.createdAt > b.createdAt) return -1
    if (a.createdAt < b.createdAt) return 1
    return 0
}

function createWalletRecord(address: string, name: string): WalletRecord {
    const now = new Date()
    return {
        address,
        name,
        erc20_token_whitelist: new Set(),
        erc20_token_blacklist: new Set(),
        erc721_token_whitelist: new Set(),
        erc721_token_blacklist: new Set(),
        erc1155_token_whitelist: new Set(),
        erc1155_token_blacklist: new Set(),
        mnemonic: [],
        passphrase: '',
        createdAt: now,
        updatedAt: now,
    }
}

export async function isEmptyWallets() {
    const t = createTransaction(await createWalletDBAccess(), 'readonly')('Wallet')
    const count = await t.objectStore('Wallet').count()
    return count === 0
}

export async function getWallet(address: string = currentAccountSettings.value) {
    const wallets = await getWallets()
    return wallets.find(currySameAddress(address))
}

export async function getWallets(provider?: ProviderType) {
    if (hasNativeAPI) {
        const accounts = await getAccounts()
        const address = first(accounts) ?? ''
        if (!address) return []
        return [createWalletRecord(address, 'Mask Network')]
    }

    const t = createTransaction(await createWalletDBAccess(), 'readonly')('Wallet')
    const records = await t.objectStore('Wallet').getAll()
    const wallets = (
        await Promise.all<WalletRecord>(
            records.map(async (record) => {
                const walletRecord = WalletRecordOutDB(record)
                return {
                    ...walletRecord,
                    _private_key_: await makePrivateKey(walletRecord),
                }
            }),
        )
    ).sort(sortWallet)
    if (provider === ProviderType.MaskWallet) return wallets.filter((x) => x._private_key_ || x.mnemonic.length)
    if (provider === currentProviderSettings.value)
        return wallets.filter(currySameAddress(currentAccountSettings.value))
    if (provider) return []
    return wallets
    async function makePrivateKey(record: WalletRecord) {
        // not a managed wallet
        if (!record._private_key_ && !record.mnemonic.length) return ''
        const { privateKey } = record._private_key_
            ? await recoverWalletFromPrivateKey(record._private_key_)
            : await recoverWalletFromMnemonicWords(record.mnemonic, record.passphrase, record.path)
        return `0x${buf2hex(privateKey)}`
    }
}

export async function updateExoticWalletFromSource(
    provider: ProviderType,
    updates: Map<string, Partial<WalletRecord>>,
): Promise<void> {
    const walletStore = createTransaction(await createWalletDBAccess(), 'readwrite')('Wallet').objectStore('Wallet')
    let modified = false
    for await (const cursor of walletStore) {
        const wallet = cursor.value
        {
            if (updates.has(formatEthereumAddress(wallet.address))) {
                await cursor.update(
                    WalletRecordIntoDB({
                        ...WalletRecordOutDB(cursor.value),
                        ...updates.get(wallet.address)!,
                        updatedAt: new Date(),
                    }),
                )
            }
            modified = true
        }
    }
    for (const address of updates.keys()) {
        const wallet = await walletStore.get(formatEthereumAddress(address))
        if (wallet) continue
        await walletStore.put(
            WalletRecordIntoDB({
                address,
                createdAt: new Date(),
                updatedAt: new Date(),
                erc20_token_blacklist: new Set(),
                erc20_token_whitelist: new Set(),
                erc721_token_blacklist: new Set(),
                erc721_token_whitelist: new Set(),
                erc1155_token_blacklist: new Set(),
                erc1155_token_whitelist: new Set(),
                name: resolveProviderName(provider),
                mnemonic: [] as string[],
                passphrase: '',
                ...updates.get(address)!,
            }),
        )
        modified = true
    }
    if (modified) WalletMessages.events.walletsUpdated.sendToAll(undefined)
}

export function createNewWallet(
    rec: Omit<
        WalletRecord,
        | 'id'
        | 'address'
        | 'mnemonic'
        | 'eth_balance'
        | 'erc20_token_whitelist'
        | 'erc20_token_blacklist'
        | 'erc721_token_whitelist'
        | 'erc721_token_blacklist'
        | 'erc1155_token_whitelist'
        | 'erc1155_token_blacklist'
        | 'createdAt'
        | 'updatedAt'
    >,
) {
    const mnemonic = bip39.generateMnemonic().split(' ')
    return importNewWallet({ mnemonic, ...rec })
}

export function createMnemonicWords() {
    return bip39.generateMnemonic().split(' ')
}

export async function importNewWallet(
    rec: PartialRequired<Omit<WalletRecord, 'id' | 'eth_balance' | 'createdAt' | 'updatedAt'>, 'name'>,
    silent = false,
) {
    const { name, path, mnemonic = [], passphrase = '' } = rec
    const address = await getWalletAddress()
    if (!address) throw new Error('cannot get the wallet address')
    if (rec.name === null) rec.name = address.slice(0, 6)
    const record: WalletRecord = {
        name,
        mnemonic,
        passphrase,
        address,
        erc20_token_whitelist: new Set(),
        erc20_token_blacklist: new Set(),
        erc721_token_whitelist: new Set(),
        erc721_token_blacklist: new Set(),
        erc1155_token_whitelist: new Set(),
        erc1155_token_blacklist: new Set(),
        createdAt: new Date(),
        updatedAt: new Date(),
    }
    if (rec.path) record.path = path
    if (rec._private_key_) record._private_key_ = rec._private_key_
    {
        const t = createTransaction(await createWalletDBAccess(), 'readwrite')('Wallet', 'ERC20Token')
        const record_ = await t.objectStore('Wallet').get(record.address)
        if (!record_) await t.objectStore('Wallet').add(WalletRecordIntoDB(record))
        else if (!record_.mnemonic.length && !record_._private_key_)
            await t.objectStore('Wallet').put(WalletRecordIntoDB(record))
    }

    WalletMessages.events.walletsUpdated.sendToAll(undefined)
    if (!silent) {
        await updateAccount({
            account: record.address,
            providerType: ProviderType.MaskWallet,
        })
    }

    return address
    async function getWalletAddress() {
        if (rec.address) return rec.address
        if (rec._private_key_) {
            const recover = await recoverWalletFromPrivateKey(rec._private_key_)
            return recover.privateKeyValid ? recover.address : ''
        }
        if (mnemonic.length) return (await recoverWalletFromMnemonicWords(mnemonic, passphrase, path)).address
        return
    }
}

export async function renameWallet(address: string, name: string) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('Wallet')
    const wallet = await getWalletByAddress(t, formatEthereumAddress(address))
    assert(wallet)
    wallet.name = name
    wallet.updatedAt = new Date()
    await t.objectStore('Wallet').put(WalletRecordIntoDB(wallet))
    WalletMessages.events.walletsUpdated.sendToAll(undefined)
}

export async function removeWallet(address: string) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('Wallet')
    const wallet = await getWalletByAddress(t, formatEthereumAddress(address))
    if (!wallet) return
    await t.objectStore('Wallet').delete(wallet.address)
    WalletMessages.events.walletsUpdated.sendToAll(undefined)
}

export async function recoverWalletFromMnemonicWords(
    mnemonic: string[],
    passphrase: string,
    path = `${HD_PATH_WITHOUT_INDEX_ETHEREUM}/0`,
) {
    const seed = await bip39.mnemonicToSeed(mnemonic.join(' '), passphrase)
    const masterKey = HDKey.parseMasterSeed(seed)
    const extendedPrivateKey = masterKey.derive(path).extendedPrivateKey!
    const childKey = HDKey.parseExtendedKey(extendedPrivateKey)
    const wallet = childKey.derive('')
    const walletPublicKey = wallet.publicKey
    const walletPrivateKey = wallet.privateKey!
    return {
        address: EthereumAddress.from(walletPublicKey).address,
        privateKey: walletPrivateKey,
        privateKeyValid: true,
        privateKeyInHex: `0x${buf2hex(walletPrivateKey)}`,
        path,
        mnemonic,
        passphrase,
    }
}

export async function recoverWalletFromPrivateKey(privateKey: string) {
    const ec = new EC('secp256k1')
    const privateKey_ = privateKey.replace(/^0x/, '') // strip 0x
    const key = ec.keyFromPrivate(privateKey_)
    return {
        address: EthereumAddress.from(key.getPublic(false, 'array') as any).address,
        privateKey: hex2buf(privateKey_),
        privateKeyValid: privateKeyVerify(privateKey_),
        privateKeyInHex: privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`,
        mnemonic: [],
    }
    function privateKeyVerify(key: string) {
        if (!/[\da-f]{64}/i.test(key)) return false
        const k = new BigNumber(key, 16)
        const n = new BigNumber('fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141', 16)
        return !k.isZero() && k.isLessThan(n)
    }
}
