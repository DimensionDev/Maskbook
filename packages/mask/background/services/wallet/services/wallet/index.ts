import * as bip39 from 'bip39'
import { first, last, omit } from 'lodash-es'
import * as web3_utils from /* webpackDefer: true */ 'web3-utils'
import { toBytes } from '@ethereumjs/util'
import { api } from '@dimensiondev/mask-wallet-core/proto'
import { Signer } from '@masknet/web3-providers'
import { ImportSource, type SignType, type Wallet } from '@masknet/shared-base'
import { HD_PATH_WITHOUT_INDEX_ETHEREUM } from '@masknet/web3-shared-base'
import * as Mask from '../maskwallet/index.js'
import * as database from './database/index.js'
import * as password from './password.js'

const MAX_DERIVE_COUNT = 99

function bumpDerivationPath(path = `${HD_PATH_WITHOUT_INDEX_ETHEREUM}/0`) {
    const splitted = path.split('/')
    const index = Number.parseInt(last(splitted) ?? '', 10)
    if (Number.isNaN(index) || index < 0 || splitted.length !== 6) throw new Error('Invalid derivation path.')
    return [...splitted.slice(0, -1), index + 1].join('/')
}

function sanitizeWallet(wallet: Wallet): Wallet {
    return omit(wallet, ['storedKeyInfo'])
}

// db
export { hasWallet, addWallet, updateWallet } from './database/wallet.js'

// password
export {
    setPassword,
    hasPassword,
    hasPasswordWithDefaultOne,
    verifyPassword,
    changePassword,
    resetPassword,
    setDefaultPassword,
    validatePassword,
    clearPassword,
} from './password.js'

export { getAutoLockerDuration, setAutoLockerTime } from './database/locker.js'

// locker
export { isLocked, lockWallet, unlockWallet, setAutoLockTimer, requestUnlockWallet } from './locker.js'

export async function getWallet(address: string) {
    const wallet = await database.getWallet(address)
    if (!wallet?.hasStoredKeyInfo) return null
    return sanitizeWallet(wallet)
}

export async function getWallets(): Promise<Wallet[]> {
    const wallets = await database.getWallets()
    return wallets.filter((x) => x.hasStoredKeyInfo).map(sanitizeWallet)
}

export async function createMnemonicWords() {
    return bip39.generateMnemonic().split(' ')
}

export async function createMnemonicId(mnemonic: string) {
    const id = web3_utils.sha3(mnemonic)
    if (!id) throw new Error('Failed to create mnemonic id.')
    return id
}

export async function getPrimaryWalletByMnemonicId(mnemonicId?: string) {
    if (!mnemonicId) return
    const wallets = await database.getWallets()

    return (
        wallets.find((x) => x.mnemonicId === mnemonicId && x.storedKeyInfo?.type === api.StoredKeyType.Mnemonic) ?? null
    )
}

export async function getWalletPrimary(mnemonicId?: string) {
    const wallets = await database.getWallets()
    const { Mnemonic } = api.StoredKeyType
    const list = wallets
        .filter((x) => x.storedKeyInfo?.type === Mnemonic && (mnemonicId ? mnemonicId === x.mnemonicId : true))
        .sort((a, z) => a.createdAt.getTime() - z.createdAt.getTime())
    return first(list) ?? null
}

export async function getDerivableAccounts(mnemonic: string, page: number, pageSize = 10) {
    const oneTimePassword = 'MASK'
    const imported = await Mask.importMnemonic({
        mnemonic,
        password: oneTimePassword,
    })
    if (!imported?.StoredKey) throw new Error('Failed to import the wallet.')

    const accounts: Array<{
        index: number
        address: string
        derivationPath: string
    }> = []

    for (let i = pageSize * page; i < pageSize * (page + 1); i += 1) {
        const derivationPath = `${HD_PATH_WITHOUT_INDEX_ETHEREUM}/${i}`
        const created = await Mask.createAccountOfCoinAtPath({
            coin: api.Coin.Ethereum,
            password: oneTimePassword,
            derivationPath,
            StoredKeyData: imported.StoredKey.data,
        })
        if (!created?.account?.address) throw new Error(`Failed to create account at path: ${derivationPath}.`)
        accounts.push({
            index: i,
            address: created.account.address,
            derivationPath,
        })
    }
    return accounts
}

export async function deriveWallet(name: string, defaultMnemonicId?: string) {
    const masterPassword = await password.INTERNAL_getMasterPasswordRequired()

    // derive wallet base on the primary wallet
    const primaryWallet = await getWalletPrimary(defaultMnemonicId)
    if (!primaryWallet?.storedKeyInfo) throw new Error('Cannot find the primary wallet.')

    let derivedTimes = 0
    let latestDerivationPath = primaryWallet.latestDerivationPath ?? primaryWallet.derivationPath
    if (!latestDerivationPath) throw new Error('Failed to derive wallet without derivation path.')

    let mnemonicId = defaultMnemonicId
    if (!mnemonicId) {
        const mnemonic = await exportMnemonicWords(primaryWallet.address, masterPassword)
        mnemonicId = await createMnemonicId(mnemonic)
    }

    while (true) {
        derivedTimes += 1

        // protect from endless looping
        if (derivedTimes >= MAX_DERIVE_COUNT) {
            await database.updateWallet(primaryWallet.address, {
                latestDerivationPath,
            })
            throw new Error('Exceed the max derivation times.')
        }

        // bump index
        latestDerivationPath = bumpDerivationPath(latestDerivationPath)

        // derive a new wallet
        const created = await Mask.createAccountOfCoinAtPath({
            coin: api.Coin.Ethereum,
            name,
            password: masterPassword,
            derivationPath: latestDerivationPath,
            StoredKeyData: primaryWallet.storedKeyInfo.data,
        })
        if (!created?.account?.address) throw new Error(`Failed to create account at path: ${latestDerivationPath}.`)

        // check its existence in DB
        if (await database.hasWallet(created.account.address)) {
            const localWallet = await database.getWallet(created.account.address)
            if (localWallet?.mnemonicId)
                await database.updateWallet(localWallet.address, {
                    mnemonicId,
                })
            continue
        }

        // update the primary wallet
        await database.updateWallet(primaryWallet.address, {
            latestDerivationPath,
        })

        // found a valid candidate, get the private key of it
        const exported = await Mask.exportPrivateKeyOfPath({
            coin: api.Coin.Ethereum,
            password: masterPassword,
            derivationPath: latestDerivationPath,
            StoredKeyData: primaryWallet.storedKeyInfo.data,
        })
        if (!exported?.privateKey) throw new Error(`Failed to export private key at path: ${latestDerivationPath}`)

        // import the candidate by the private key
        return createWalletFromPrivateKey(name, exported.privateKey, mnemonicId, latestDerivationPath)
    }
}

export async function generateNextDerivationAddress() {
    const masterPassword = await password.INTERNAL_getMasterPasswordRequired()

    // derive wallet base on the primary wallet
    const primaryWallet = await getWalletPrimary()
    if (!primaryWallet?.storedKeyInfo) throw new Error('Cannot find the primary wallet.')

    let derivedTimes = 0
    let latestDerivationPath = primaryWallet.latestDerivationPath ?? primaryWallet.derivationPath
    if (!latestDerivationPath) throw new Error('Failed to derive wallet without derivation path.')

    while (true) {
        derivedTimes += 1

        // protect from endless looping
        if (derivedTimes >= MAX_DERIVE_COUNT) throw new Error('Exceed the max derivation times.')

        // bump index
        latestDerivationPath = bumpDerivationPath(latestDerivationPath)

        // derive a new wallet
        const created = await Mask.createAccountOfCoinAtPath({
            coin: api.Coin.Ethereum,
            name: '',
            password: masterPassword,
            derivationPath: latestDerivationPath,
            StoredKeyData: primaryWallet.storedKeyInfo.data,
        })
        if (!created?.account?.address) throw new Error(`Failed to create account at path: ${latestDerivationPath}.`)

        // check its existence in DB
        if (await database.hasWallet(created.account.address)) continue

        // found a valid candidate, get the private key of it
        const exported = await Mask.exportPrivateKeyOfPath({
            coin: api.Coin.Ethereum,
            password: masterPassword,
            derivationPath: latestDerivationPath,
            StoredKeyData: primaryWallet.storedKeyInfo.data,
        })
        if (!exported?.privateKey) throw new Error(`Failed to export private key at path: ${latestDerivationPath}`)

        return generateAddressFromPrivateKey(exported.privateKey)
    }
}

export async function renameWallet(address: string, name: string) {
    const name_ = name.trim()
    if (name_.length <= 0) throw new Error('Invalid wallet name.')
    await database.updateWallet(address, {
        name: name_,
    })
}

export async function removeWallet(address: string, unverifiedPassword: string) {
    await password.verifyPasswordRequired(unverifiedPassword)
    const wallet = await database.getWalletRequired(address)
    await database.deleteWallet(wallet.address)
}

export async function resetAllWallets() {
    await database.resetAllWallets()
}

export async function signWithWallet<T>(type: SignType, message: T, address: string) {
    return Signer.sign(type, Buffer.from(toBytes(`0x${await exportPrivateKey(address)}`)), message)
}

export async function exportMnemonicWords(address: string, unverifiedPassword?: string) {
    if (unverifiedPassword) await password.verifyPasswordRequired(unverifiedPassword)
    const masterPassword = await password.INTERNAL_getMasterPasswordRequired()
    const wallet = await database.getWalletRequired(address)
    if (wallet.storedKeyInfo?.type !== api.StoredKeyType.Mnemonic)
        throw new Error(`Cannot export mnemonic words of ${address}.`)
    const exported = await Mask.exportMnemonic({
        password: masterPassword,
        StoredKeyData: wallet.storedKeyInfo.data,
    })
    if (!exported?.mnemonic) throw new Error(`Failed to export mnemonic words of ${address}.`)
    return exported.mnemonic
}

export async function exportPrivateKey(address: string, unverifiedPassword?: string) {
    if (unverifiedPassword) await password.verifyPasswordRequired(unverifiedPassword)
    const masterPassword = await password.INTERNAL_getMasterPasswordRequired()
    const wallet = await database.getWalletRequired(address)
    if (!wallet.storedKeyInfo) throw new Error(`Cannot export private key of ${address}.`)
    const exported =
        wallet.derivationPath && !wallet.configurable ?
            await Mask.exportPrivateKeyOfPath({
                coin: api.Coin.Ethereum,
                derivationPath: wallet.derivationPath ?? `${HD_PATH_WITHOUT_INDEX_ETHEREUM}/0`,
                password: masterPassword,
                StoredKeyData: wallet.storedKeyInfo.data,
            })
        :   await Mask.exportPrivateKey({
                coin: api.Coin.Ethereum,
                password: masterPassword,
                StoredKeyData: wallet.storedKeyInfo.data,
            })

    if (!exported?.privateKey) throw new Error(`Failed to export private key of ${address}.`)
    return exported.privateKey
}

export async function exportKeyStoreJSON(address: string, unverifiedPassword?: string) {
    if (unverifiedPassword) await password.verifyPasswordRequired(unverifiedPassword)
    const masterPassword = await password.INTERNAL_getMasterPasswordRequired()
    const wallet = await database.getWalletRequired(address)
    if (!wallet.storedKeyInfo) throw new Error(`Cannot export private key of ${address}.`)

    const exported =
        wallet.derivationPath && !wallet.configurable ?
            await Mask.exportKeyStoreJSONOfPath({
                coin: api.Coin.Ethereum,
                derivationPath: wallet.derivationPath ?? `${HD_PATH_WITHOUT_INDEX_ETHEREUM}/0`,
                password: masterPassword,
                newPassword: unverifiedPassword,
                StoredKeyData: wallet.storedKeyInfo.data,
            })
        :   await Mask.exportKeyStoreJSONOfAddress({
                coin: api.Coin.Ethereum,
                password: masterPassword,
                newPassword: unverifiedPassword,
                StoredKeyData: wallet.storedKeyInfo.data,
            })
    if (!exported?.json) throw new Error(`Failed to export keystore JSON of ${address}.`)
    return exported.json
}

async function addWalletFromMnemonicWords(
    source: ImportSource,
    name: string,
    mnemonic: string,
    derivationPath: string,
) {
    const masterPassword = await password.INTERNAL_getMasterPasswordRequired()
    const imported = await Mask.importMnemonic({
        mnemonic,
        password: masterPassword,
    })

    if (!imported?.StoredKey) throw new Error('Failed to import the wallet.')

    const mnemonicId = await createMnemonicId(mnemonic)
    if (await database.hasStoredKeyInfo(imported.StoredKey)) {
        const exported = await Mask.exportPrivateKeyOfPath({
            coin: api.Coin.Ethereum,
            derivationPath,
            password: masterPassword,
            StoredKeyData: imported.StoredKey.data,
        })
        if (!exported?.privateKey) throw new Error(`Failed to export private key at path: ${derivationPath}`)

        return addWalletFromPrivateKey(source, name, exported.privateKey, mnemonicId, derivationPath)
    } else {
        const created = await Mask.createAccountOfCoinAtPath({
            coin: api.Coin.Ethereum,
            name,
            password: masterPassword,
            derivationPath,
            StoredKeyData: imported.StoredKey.data,
        })
        if (!created?.account?.address) throw new Error('Failed to create the wallet.')
        return database.addWallet(source, created.account.address, {
            name,
            derivationPath,
            storedKeyInfo: imported.StoredKey,
            mnemonicId,
        })
    }
}

async function addWalletFromPrivateKey(
    source: ImportSource,
    name: string,
    privateKey: string,
    mnemonicId?: string,
    derivationPath?: string,
) {
    const masterPassword = await password.INTERNAL_getMasterPasswordRequired()
    const imported = await Mask.importPrivateKey({
        coin: api.Coin.Ethereum,
        name,
        password: masterPassword,
        privateKey: privateKey.replace(/^0x/, '').trim(),
    })
    if (!imported?.StoredKey) throw new Error('Failed to import the wallet.')
    const created = await Mask.createAccountOfCoinAtPath({
        coin: api.Coin.Ethereum,
        name,
        password: masterPassword,
        derivationPath: null,
        StoredKeyData: imported.StoredKey.data,
    })
    if (!created?.account?.address) throw new Error('Failed to create the wallet.')
    return database.addWallet(source, created.account.address, {
        name,
        storedKeyInfo: imported.StoredKey,
        mnemonicId,
        derivationPath,
    })
}

export function createWalletFromMnemonicWords(
    name: string,
    mnemonic: string,
    derivationPath = `${HD_PATH_WITHOUT_INDEX_ETHEREUM}/0`,
) {
    return addWalletFromMnemonicWords(ImportSource.LocalGenerated, name, mnemonic, derivationPath)
}

function createWalletFromPrivateKey(name: string, privateKey: string, mnemonicId?: string, derivationPath?: string) {
    return addWalletFromPrivateKey(ImportSource.LocalGenerated, name, privateKey, mnemonicId, derivationPath)
}

export function recoverWalletFromMnemonicWords(
    name: string,
    mnemonic: string,
    derivationPath = `${HD_PATH_WITHOUT_INDEX_ETHEREUM}/0`,
) {
    return addWalletFromMnemonicWords(ImportSource.UserProvided, name, mnemonic, derivationPath)
}

export function recoverWalletFromPrivateKey(
    name: string,
    privateKey: string,
    mnemonicId?: string,
    derivationPath?: string,
) {
    return addWalletFromPrivateKey(ImportSource.UserProvided, name, privateKey, mnemonicId, derivationPath)
}

export async function recoverWalletFromKeyStoreJSON(name: string, json: string, jsonPassword: string) {
    const masterPassword = await password.INTERNAL_getMasterPasswordRequired()
    const imported = await Mask.importJSON({
        coin: api.Coin.Ethereum,
        json,
        keyStoreJsonPassword: jsonPassword,
        name,
        password: masterPassword,
    })
    if (!imported?.StoredKey) throw new Error('Failed to import the wallet.')
    const created = await Mask.createAccountOfCoinAtPath({
        coin: api.Coin.Ethereum,
        derivationPath: null,
        name,
        password: masterPassword,
        StoredKeyData: imported.StoredKey.data,
    })
    if (!created?.account?.address) throw new Error('Failed to create the wallet.')

    return database.addWallet(ImportSource.UserProvided, created.account.address, {
        name,
        storedKeyInfo: imported.StoredKey,
    })
}

export async function generateAddressFromPrivateKey(privateKey: string) {
    const masterPassword = await password.INTERNAL_getMasterPasswordRequired()
    const imported = await Mask.importPrivateKey({
        coin: api.Coin.Ethereum,
        name: '',
        password: masterPassword,
        privateKey: privateKey.replace(/^0x/, '').trim(),
    })
    if (!imported?.StoredKey) throw new Error('Failed to import the wallet.')
    const created = await Mask.createAccountOfCoinAtPath({
        coin: api.Coin.Ethereum,
        name: '',
        password: masterPassword,
        derivationPath: null,
        StoredKeyData: imported.StoredKey.data,
    })
    if (!created?.account?.address) throw new Error('Failed to create the wallet.')
    return created.account.address
}

export async function generateAddressFromKeyStoreJSON(json: string, jsonPassword: string) {
    const masterPassword = await password.INTERNAL_getMasterPasswordRequired()
    const imported = await Mask.importJSON({
        coin: api.Coin.Ethereum,
        json,
        keyStoreJsonPassword: jsonPassword,
        name: '',
        password: masterPassword,
    })
    if (!imported?.StoredKey) throw new Error('Failed to import the wallet.')
    const created = await Mask.createAccountOfCoinAtPath({
        coin: api.Coin.Ethereum,
        derivationPath: null,
        name: '',
        password: masterPassword,
        StoredKeyData: imported.StoredKey.data,
    })
    if (!created?.account?.address) throw new Error('Failed to create the wallet.')
    return created.account.address
}

export async function generateAddressFromMnemonicWords(
    name: string,
    mnemonic: string,
    derivationPath = `${HD_PATH_WITHOUT_INDEX_ETHEREUM}/0`,
) {
    const oneTimePassword = 'MASK'
    const imported = await Mask.importMnemonic({
        mnemonic,
        password: oneTimePassword,
    })
    if (!imported?.StoredKey) throw new Error('Failed to import the wallet.')
    const created = await Mask.createAccountOfCoinAtPath({
        coin: api.Coin.Ethereum,
        name,
        password: oneTimePassword,
        derivationPath,
        StoredKeyData: imported.StoredKey.data,
    })
    return created?.account?.address ?? undefined
}
