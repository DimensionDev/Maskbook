import * as bip39 from 'bip39'
import { first, last } from 'lodash-unified'
import { toHex } from 'web3-utils'
import { toBuffer } from 'ethereumjs-util'
import { personalSign, signTypedData as signTypedData_, SignTypedDataVersion } from '@metamask/eth-sig-util'
import { encodeText } from '@dimensiondev/kit'
import { isSameAddress } from '@masknet/web3-shared-base'
import type { Transaction } from '@masknet/web3-shared-evm'
import { api } from '@dimensiondev/mask-wallet-core/proto'
import { MAX_DERIVE_COUNT, HD_PATH_WITHOUT_INDEX_ETHEREUM } from '@masknet/plugin-wallet'
import * as database from './database'
import * as password from './password'
import * as Mask from '../maskwallet'
import { hasNativeAPI } from '../../../../../shared/native-rpc'
import type { WalletRecord } from './type'

function bumpDerivationPath(path = `${HD_PATH_WITHOUT_INDEX_ETHEREUM}/0`) {
    const splitted = path.split('/')
    const index = Number.parseInt(last(splitted) ?? '', 10)
    if (Number.isNaN(index) || index < 0 || splitted.length !== 6) throw new Error('Invalid derivation path.')
    return [...splitted.slice(0, -1), index + 1].join('/')
}

// wallet db
export { hasWallet, updateWallet } from './database/wallet'

// password
export { setPassword, hasPassword, verifyPassword, changePassword, validatePassword, clearPassword } from './password'

// locker
export { isLocked, lockWallet, unlockWallet } from './locker'

export async function getWallet(address?: string) {
    if (hasNativeAPI) {
        const wallets = await getWallets()
        return wallets.find((x) => isSameAddress(x.address, address))
    }
    return database.getWallet(address)
}

export async function getWallets(): Promise<
    Array<
        Omit<WalletRecord, 'type'> & {
            configurable: boolean
            hasStoredKeyInfo: boolean
            hasDerivationPath: boolean
        }
    >
> {
    // if (hasNativeAPI) {
    //     // read wallet from rpc
    //     const accounts = await EVM_RPC.getAccounts()
    //     const address = first(accounts) ?? ''
    //     if (!address) return []

    //     const now = new Date()
    //     const address_ = formatEthereumAddress(address)
    //     return [
    //         {
    //             id: address_,
    //             name: 'Mask Network',
    //             address: address_,
    //             createdAt: now,
    //             updatedAt: now,
    //             configurable: false,
    //             hasStoredKeyInfo: false,
    //             hasDerivationPath: false,
    //         },
    //     ]
    // }
    return database.getWallets()
}

export function createMnemonicWords() {
    return bip39.generateMnemonic().split(' ')
}

export async function getWalletPrimary() {
    if (hasNativeAPI) return null
    return (
        first(
            (await database.getWallets())
                .filter((x) => x.storedKeyInfo?.type === api.StoredKeyType.Mnemonic)
                .sort((a, z) => a.createdAt.getTime() - z.createdAt.getTime()),
        ) ?? null
    )
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

export async function signTransaction(address: string, config: Transaction) {
    const password_ = await password.INTERNAL_getPasswordRequired()
    const wallet = await database.getWalletRequired(address)
    const signed = await Mask.signTransaction({
        password: password_,
        coin: api.Coin.Ethereum,
        storedKeyData: wallet.storedKeyInfo?.data,
        sign_input: {
            amount: (config.value as string) ?? '0x0',
            gas_limit: config.gas?.toString() ?? '0x0',
            gas_price: config.gasPrice?.toString() ?? '0x0',
            chain_id: config.chainId ? toHex(config.chainId?.toString()) : '0x1',
            max_fee_per_gas: (config.maxFeePerGas as string | undefined) ?? '0x0',
            max_inclusion_fee_per_gas: (config.maxFeePerGas as string | undefined) ?? '0x0',
            nonce: config.nonce ? toHex(config.nonce) : '0x0',
            to_address: config.to,
            payload: config.data ? encodeText(config.data) : new Uint8Array(),
        },
    })

    if (!signed?.sign_output?.encoded) throw new Error('Failed to sign transaction.')
    return `0x${Buffer.from(signed.sign_output.encoded).toString('hex')}`
}

export async function signPersonalMessage(address: string, message: string, password?: string) {
    return personalSign({
        privateKey: toBuffer(`0x${await exportPrivateKey(address, password)}`),
        data: message,
    })
}

export async function signTypedData(address: string, data: string, password?: string) {
    return signTypedData_({
        privateKey: toBuffer(`0x${await exportPrivateKey(address, password)}`),
        data: JSON.parse(data),
        version: SignTypedDataVersion.V4,
    })
}

export async function deriveWallet(name: string) {
    const password_ = await password.INTERNAL_getPasswordRequired()

    // derive wallet base on the primary wallet
    const primaryWallet = await getWalletPrimary()
    if (!primaryWallet?.storedKeyInfo) throw new Error('Cannot find the primary wallet.')

    let derivedTimes = 0
    let latestDerivationPath = primaryWallet.latestDerivationPath ?? primaryWallet.derivationPath
    if (!latestDerivationPath) throw new Error('Failed to derive wallet without derivation path.')

    // eslint-disable-next-line no-constant-condition
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
            password: password_,
            derivationPath: latestDerivationPath,
            StoredKeyData: primaryWallet.storedKeyInfo.data,
        })
        if (!created?.account?.address) throw new Error(`Failed to create account at path: ${latestDerivationPath}.`)

        // check its existence in DB
        if (await database.hasWallet(created.account.address)) continue

        // update the primary wallet
        await database.updateWallet(primaryWallet.address, {
            latestDerivationPath,
        })

        // found a valid candidate, get the private key of it
        const exported = await Mask.exportPrivateKeyOfPath({
            coin: api.Coin.Ethereum,
            password: password_,
            derivationPath: latestDerivationPath,
            StoredKeyData: primaryWallet.storedKeyInfo.data,
        })
        if (!exported?.privateKey) throw new Error(`Failed to export private key at path: ${latestDerivationPath}`)

        // import the candidate by the private key
        return recoverWalletFromPrivateKey(name, exported.privateKey)
    }
}

export async function renameWallet(address: string, name: string) {
    const name_ = name.trim()
    if (name_.length <= 0 || name_.length > 12) throw new Error('Invalid wallet name.')
    await database.updateWallet(address, {
        name: name_,
    })
}

export async function removeWallet(address: string, unverifiedPassword: string) {
    await password.verifyPasswordRequired(unverifiedPassword)

    // delete a wallet with derivationPath is not allowed
    const wallet = await database.getWalletRequired(address)
    if (wallet.derivationPath) throw new Error('Illegal operation.')

    await database.deleteWallet(wallet.address)
}

export async function exportMnemonic(address: string, unverifiedPassword?: string) {
    if (unverifiedPassword) await password.verifyPasswordRequired(unverifiedPassword)
    const password_ = await password.INTERNAL_getPasswordRequired()
    const wallet = await database.getWalletRequired(address)
    if (wallet.storedKeyInfo?.type !== api.StoredKeyType.Mnemonic)
        throw new Error(`Cannot export mnemonic words of ${address}.`)
    const exported = await Mask.exportMnemonic({
        password: password_,
        StoredKeyData: wallet.storedKeyInfo.data,
    })
    if (!exported?.mnemonic) throw new Error(`Failed to export mnemonic words of ${address}.`)
    return exported.mnemonic
}

export async function exportPrivateKey(address: string, unverifiedPassword?: string) {
    if (unverifiedPassword) await password.verifyPasswordRequired(unverifiedPassword)
    const password_ = await password.INTERNAL_getPasswordRequired()
    const wallet = await database.getWalletRequired(address)
    if (!wallet.storedKeyInfo) throw new Error(`Cannot export private key of ${address}.`)
    const exported = wallet.derivationPath
        ? await Mask.exportPrivateKeyOfPath({
              coin: api.Coin.Ethereum,
              derivationPath: wallet.derivationPath ?? `${HD_PATH_WITHOUT_INDEX_ETHEREUM}/0`,
              password: password_,
              StoredKeyData: wallet.storedKeyInfo.data,
          })
        : await Mask.exportPrivateKey({
              coin: api.Coin.Ethereum,
              password: password_,
              StoredKeyData: wallet.storedKeyInfo.data,
          })

    if (!exported?.privateKey) throw new Error(`Failed to export private key of ${address}.`)
    return exported.privateKey
}

export async function exportKeyStoreJSON(address: string, unverifiedPassword?: string) {
    if (unverifiedPassword) await password.verifyPasswordRequired(unverifiedPassword)
    const password_ = await password.INTERNAL_getPasswordRequired()
    const wallet = await database.getWalletRequired(address)
    if (!wallet.storedKeyInfo) throw new Error(`Cannot export private key of ${address}.`)
    const exported = wallet.derivationPath
        ? await Mask.exportKeyStoreJSONOfPath({
              coin: api.Coin.Ethereum,
              derivationPath: wallet.derivationPath ?? `${HD_PATH_WITHOUT_INDEX_ETHEREUM}/0`,
              password: password_,
              newPassword: unverifiedPassword,
              StoredKeyData: wallet.storedKeyInfo.data,
          })
        : await Mask.exportKeyStoreJSONOfAddress({
              coin: api.Coin.Ethereum,
              password: password_,
              newPassword: unverifiedPassword,
              StoredKeyData: wallet.storedKeyInfo.data,
          })
    if (!exported?.json) throw new Error(`Failed to export keystore JSON of ${address}.`)
    return exported.json
}

export async function recoverWalletFromMnemonic(
    name: string,
    mnemonic: string,
    derivationPath = `${HD_PATH_WITHOUT_INDEX_ETHEREUM}/0`,
) {
    const password_ = await password.INTERNAL_getPasswordRequired()
    const imported = await Mask.importMnemonic({
        mnemonic,
        password: password_,
    })
    if (!imported?.StoredKey) throw new Error('Failed to import the wallet.')

    if (await database.hasStoredKeyInfo(imported.StoredKey)) {
        const exported = await Mask.exportPrivateKeyOfPath({
            coin: api.Coin.Ethereum,
            derivationPath,
            password: password_,
            StoredKeyData: imported.StoredKey.data,
        })
        if (!exported?.privateKey) throw new Error(`Failed to export private key at path: ${derivationPath}`)
        return recoverWalletFromPrivateKey(name, exported.privateKey)
    } else {
        const created = await Mask.createAccountOfCoinAtPath({
            coin: api.Coin.Ethereum,
            name,
            password: password_,
            derivationPath,
            StoredKeyData: imported.StoredKey.data,
        })
        if (!created?.account?.address) throw new Error('Failed to create the wallet.')
        return database.addWallet(created.account.address, name, derivationPath, imported.StoredKey)
    }
}

export async function recoverWalletFromPrivateKey(name: string, privateKey: string) {
    const password_ = await password.INTERNAL_getPasswordRequired()
    const imported = await Mask.importPrivateKey({
        coin: api.Coin.Ethereum,
        name,
        password: password_,
        privateKey: privateKey.replace(/^0x/, '').trim(),
    })
    if (!imported?.StoredKey) throw new Error('Failed to import the wallet.')
    const created = await Mask.createAccountOfCoinAtPath({
        coin: api.Coin.Ethereum,
        name,
        password: password_,
        derivationPath: null,
        StoredKeyData: imported.StoredKey.data,
    })
    if (!created?.account?.address) throw new Error('Failed to create the wallet.')
    return database.addWallet(created.account.address, name, undefined, imported.StoredKey)
}

export async function recoverWalletFromKeyStoreJSON(name: string, json: string, jsonPassword: string) {
    const password_ = await password.INTERNAL_getPasswordRequired()
    const imported = await Mask.importJSON({
        coin: api.Coin.Ethereum,
        json,
        keyStoreJsonPassword: jsonPassword,
        name,
        password: password_,
    })
    if (!imported?.StoredKey) throw new Error('Failed to import the wallet.')
    const created = await Mask.createAccountOfCoinAtPath({
        coin: api.Coin.Ethereum,
        derivationPath: null,
        name,
        password: password_,
        StoredKeyData: imported.StoredKey.data,
    })
    if (!created?.account?.address) throw new Error('Failed to create the wallet.')
    return database.addWallet(created.account.address, name, undefined, imported.StoredKey)
}
