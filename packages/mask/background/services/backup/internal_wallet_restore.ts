import type { NormalizedBackup } from '@masknet/backup-format'
import { concatArrayBuffer } from '@masknet/kit'
import { fromBase64URL, isK256Point, isK256PrivateKey, type EC_JsonWebKey } from '@masknet/shared-base'
import { ChainbaseDomain } from '@masknet/web3-providers'
import { HD_PATH_WITHOUT_INDEX_ETHEREUM, currySameAddress, generateNewWalletName } from '@masknet/web3-shared-base'
import { ec as EC } from 'elliptic'
import {
    getDerivableAccounts,
    createMnemonicId,
    getWallets,
    recoverWalletFromMnemonicWords,
    recoverWalletFromPrivateKey,
} from '../wallet/services/index.js'
import { ChainId, formatEthereumAddress } from '@masknet/web3-shared-evm'

export async function internal_wallet_restore(backup: NormalizedBackup.WalletBackup[]) {
    const mnemonicWalletMap = new Map<
        string,
        {
            mnemonicId: string
            derivationPath: string
        }
    >()
    if (backup.some((x) => !!x.mnemonic.isSome())) {
        const mnemonicWallets = backup.filter((x) => !!x.mnemonic.isSome())
        for (const wallet of mnemonicWallets) {
            if (wallet.mnemonic.isSome()) {
                const accounts = await getDerivableAccounts(wallet.mnemonic.value.words, 0, 10)
                const mnemonicId = await createMnemonicId(wallet.mnemonic.value.words)
                if (!mnemonicId) continue

                accounts.forEach((x) => {
                    mnemonicWalletMap.set(formatEthereumAddress(x.address), {
                        mnemonicId,
                        derivationPath: x.derivationPath,
                    })
                })
            }
        }
    }

    for (const wallet of backup) {
        try {
            const wallets = await getWallets()
            const matchedDefaultNameFormat = wallet.name.match(/Wallet (\d+)/)
            const digitIndex = matchedDefaultNameFormat?.[1]
            let name = wallet.name
            if (!name) {
                const ens = await ChainbaseDomain.reverse(ChainId.Mainnet, wallet.address)
                if (ens) name = ens
            }
            if (!name) {
                name = generateNewWalletName(
                    wallets,
                    undefined,
                    digitIndex && !Number.isNaN(digitIndex) ? Number(digitIndex) : undefined,
                )
            }
            if (wallet.privateKey.isSome()) {
                const info = mnemonicWalletMap.get(wallet.address)
                await recoverWalletFromPrivateKey(
                    name,
                    await JWKToKey(wallet.privateKey.value, 'private'),
                    wallet.mnemonicId.unwrapOr(undefined) ?? info?.mnemonicId,
                    wallet.derivationPath.unwrapOr(undefined) ?? info?.derivationPath,
                )
            } else if (wallet.mnemonic.isSome()) {
                // fix a backup bug of pre-v2.2.2 versions
                const accounts = await getDerivableAccounts(wallet.mnemonic.value.words, 1, 5)
                const index = accounts.findIndex(currySameAddress(wallet.address))
                await recoverWalletFromMnemonicWords(
                    name,
                    wallet.mnemonic.value.words,
                    index !== -1 ? `${HD_PATH_WITHOUT_INDEX_ETHEREUM}/${index}` : wallet.mnemonic.value.path,
                )
            }
        } catch (error) {
            console.error(error)
            continue
        }
    }
}

async function JWKToKey(jwk: EC_JsonWebKey, type: 'public' | 'private'): Promise<string> {
    const ec = new EC('secp256k1')
    if (type === 'public' && jwk.x && jwk.y) {
        const xb = fromBase64URL(jwk.x)
        const yb = fromBase64URL(jwk.y)
        const point = new Uint8Array(concatArrayBuffer(new Uint8Array([4]), xb, yb))
        if (await isK256Point(point)) return `0x${ec.keyFromPublic(point).getPublic(false, 'hex')}`
    }
    if (type === 'private' && jwk.d) {
        const db = fromBase64URL(jwk.d)
        if (await isK256PrivateKey(db)) return `0x${ec.keyFromPrivate(db).getPrivate('hex')}`
    }
    throw new Error('invalid private key')
}
