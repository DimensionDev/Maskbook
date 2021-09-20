import * as bip39 from 'bip39'
import { first, last } from 'lodash-es'
import { unreachable } from '@dimensiondev/kit'
import { ProviderType } from '@masknet/web3-shared'
import { api } from '@dimensiondev/mask-wallet-core/proto'
import { MAX_DERIVE_COUNT, HD_PATH_WITHOUT_INDEX_ETHEREUM } from '@masknet/plugin-wallet'
import * as sdk from './maskwallet'
import * as database from './database'
import * as password from './password'

function bumpDerivationPath(path = `${HD_PATH_WITHOUT_INDEX_ETHEREUM}/0`) {
    const splitted = path.split('/')
    const index = Number.parseInt(last(splitted) ?? '', 10)
    if (Number.isNaN(index) || index <= 0 || splitted.length !== 6) throw new Error('Invalid derivation path.')
    return [...splitted.slice(0, -1), index + 1].join('/')
}

// wallet db
export { getWallet, getWallets, removeWallet, updateWallet } from './database'

// password
export { setPassword, hasPassword, verifyPassword, changePassword, validatePassword, clearPassword } from './password'

export function createMnemonicWords() {
    return bip39.generateMnemonic().split(' ')
}

export async function getPrimaryWallet() {
    return first(
        (await database.getWallets(ProviderType.MaskWallet))
            .filter((x) => x.storedKeyInfo?.type === api.StoredKeyType.Mnemonic)
            .sort((a, z) => a.createdAt.getTime() - z.createdAt.getTime()),
    )
}

export async function createWallet(name: string) {
    const password_ = password.INTERNAL_getPasswordRequired()
    const primaryWallet = await getPrimaryWallet()
    if (!primaryWallet?.storedKeyInfo) throw new Error('Cannot find the primary wallet.')

    let derivatedTimes = 0
    let derivationPath = primaryWallet.derivationPath
    while (true) {
        derivatedTimes += 1
        derivationPath = bumpDerivationPath(derivationPath)

        // protect from endless looping
        if (derivatedTimes >= MAX_DERIVE_COUNT) {
            await database.updateWallet(primaryWallet.address, {
                derivationPath,
            })
            throw new Error('Exceed the max derivation times.')
        }

        // derive wallet and check existence
        const created = await sdk.createAccountOfCoinAtPath({
            coin: api.Coin.Ethereum,
            name,
            password: password_,
            derivationPath,
            StoredKeyData: primaryWallet.storedKeyInfo.data,
        })
        if (!created?.account?.address) throw new Error(`Failed to create account at path: ${derivationPath}.`)
        if (await database.hasWallet(created.account.address)) continue

        // update the primary wallet
        await database.updateWallet(primaryWallet.address, {
            derivationPath,
        })

        // a valid candidate is found import it by private key
        const exported = await sdk.exportPrivateKeyOfPath({
            coin: api.Coin.Ethereum,
            password: password_,
            derivationPath,
            StoredKeyData: primaryWallet.storedKeyInfo.data,
        })
        if (!exported?.privateKey) throw new Error(`Failed to export private key at path: ${derivationPath}`)
        return recoverWalletFromPrivateKey(name, exported.privateKey, derivationPath)
    }
}

export async function renameWallet(address: string, name: string) {
    await database.updateWallet(address, {
        name,
    })
}

export async function exportMnemonic(address: string) {
    const password_ = password.INTERNAL_getPasswordRequired()
    const wallet = await database.getWalletRequired(address)
    if (wallet.storedKeyInfo?.type !== api.StoredKeyType.Mnemonic)
        throw new Error(`Cannot export mnemonic words of ${address}.`)
    const exported = await sdk.exportMnemonic({
        password: password_,
        StoredKeyData: wallet.storedKeyInfo.data,
    })
    if (!exported?.mnemonic) throw new Error(`Failed to export mnemonic words of ${address}.`)
    return exported.mnemonic
}

export async function exportPrivateKey(address: string) {
    const password_ = password.INTERNAL_getPasswordRequired()
    const wallet = await database.getWalletRequired(address)
    if (typeof wallet.storedKeyInfo?.type === 'undefined' || wallet.storedKeyInfo?.type === null)
        throw new Error(`Cannot export private key of ${address}.`)
    switch (wallet.storedKeyInfo.type) {
        case api.StoredKeyType.Mnemonic: {
            const exported = await sdk.exportPrivateKeyOfPath({
                coin: api.Coin.Ethereum,
                derivationPath: `${HD_PATH_WITHOUT_INDEX_ETHEREUM}/0`,
                password: password_,
                StoredKeyData: wallet.storedKeyInfo.data,
            })
            if (!exported?.privateKey) throw new Error(`Failed to export private key of ${address}.`)
            return exported.privateKey
        }
        case api.StoredKeyType.PrivateKey: {
            const exported = await sdk.exportPrivateKey({
                coin: api.Coin.Ethereum,
                password: password_,
                StoredKeyData: wallet.storedKeyInfo.data,
            })
            if (!exported?.privateKey) throw new Error(`Failed to export private key of ${address}.`)
            return exported.privateKey
        }
        default:
            unreachable(wallet.storedKeyInfo.type)
    }
}

export async function exportKeyStoreJSON(address: string) {
    const password_ = password.INTERNAL_getPasswordRequired()
    const wallet = await database.getWalletRequired(address)
    if (typeof wallet.storedKeyInfo?.type === 'undefined' || wallet.storedKeyInfo?.type === null)
        throw new Error(`Cannot export keystore JSON of ${address}.`)
    switch (wallet.storedKeyInfo.type) {
        case api.StoredKeyType.Mnemonic: {
            const exported = await sdk.exportKeyStoreJSONOfPath({
                coin: api.Coin.Ethereum,
                derivationPath: `${HD_PATH_WITHOUT_INDEX_ETHEREUM}/0`,
                password: password_,
                StoredKeyData: wallet.storedKeyInfo.data,
            })
            if (!exported?.json) throw new Error(`Failed to export keystore JSON of ${address}.`)
            return exported.json
        }
        case api.StoredKeyType.PrivateKey: {
            const exported = await sdk.exportKeyStoreJSONOfAddress({
                coin: api.Coin.Ethereum,
                password: password_,
                StoredKeyData: wallet.storedKeyInfo.data,
            })
            if (!exported?.json) throw new Error(`Failed to export keystore JSON of ${address}.`)
            return exported.json
        }
        default:
            unreachable(wallet.storedKeyInfo.type)
    }
}

export async function recoverWalletFromMnemonic(
    name: string,
    mnemonic: string,
    derivationPath = `${HD_PATH_WITHOUT_INDEX_ETHEREUM}/0`,
) {
    const password_ = password.INTERNAL_getPasswordRequired()
    const imported = await sdk.importMnemonic({
        mnemonic,
        password: password_,
    })
    if (!imported?.StoredKey) throw new Error('Failed to import the wallet.')
    const created = await sdk.createAccountOfCoinAtPath({
        coin: api.Coin.Ethereum,
        name,
        password: password_,
        derivationPath,
        StoredKeyData: imported.StoredKey.data,
    })
    if (!created?.account?.address) throw new Error('Failed to create the wallet.')
    return database.addWallet(created.account.address, name, derivationPath, imported.StoredKey)
}

export async function recoverWalletFromPrivateKey(
    name: string,
    privateKey: string,
    derivationPath = `${HD_PATH_WITHOUT_INDEX_ETHEREUM}/0`,
) {
    const password_ = password.INTERNAL_getPasswordRequired()
    const imported = await sdk.importPrivateKey({
        coin: api.Coin.Ethereum,
        name,
        password: password_,
        privateKey,
    })
    if (!imported?.StoredKey) throw new Error('Failed to import the wallet.')
    const created = await sdk.createAccountOfCoinAtPath({
        coin: api.Coin.Ethereum,
        name,
        password: password_,
        derivationPath,
        StoredKeyData: imported.StoredKey.data,
    })
    if (!created?.account?.address) throw new Error('Failed to create the wallet.')
    return database.addWallet(created.account.address, name, derivationPath, imported.StoredKey)
}

export async function recoverWalletFromKeyStoreJSON(
    name: string,
    json: string,
    jsonPassword: string,
    derivationPath = `${HD_PATH_WITHOUT_INDEX_ETHEREUM}/0`,
) {
    const password_ = password.INTERNAL_getPasswordRequired()
    const imported = await sdk.importJSON({
        coin: api.Coin.Ethereum,
        json,
        keyStoreJsonPassword: jsonPassword,
        name,
        password: password_,
    })
    if (!imported?.StoredKey) throw new Error('Failed to import the wallet.')
    const created = await sdk.createAccountOfCoinAtPath({
        coin: api.Coin.Ethereum,
        derivationPath,
        name,
        password: password_,
        StoredKeyData: imported.StoredKey.data,
    })
    if (!created?.account?.address) throw new Error('Failed to create the wallet.')
    return database.addWallet(created.account.address, name, derivationPath, imported.StoredKey)
}
