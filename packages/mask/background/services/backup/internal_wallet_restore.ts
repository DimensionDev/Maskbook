import { ec as EC } from 'elliptic'
import { concatArrayBuffer } from '@masknet/kit'
import type { NormalizedBackup } from '@masknet/backup-format'
import {
    currySameAddress,
    HD_PATH_WITHOUT_INDEX_ETHEREUM,
    generateNewWalletName,
    generateUniqueWalletName,
} from '@masknet/web3-shared-base'
import { fromBase64URL, type EC_JsonWebKey, isK256Point, isK256PrivateKey } from '@masknet/shared-base'
import {
    getDerivableAccounts,
    getWallets,
    recoverWalletFromMnemonicWords,
    recoverWalletFromPrivateKey,
} from '../wallet/services/index.js'

export async function internal_wallet_restore(backup: NormalizedBackup.WalletBackup[]) {
    for (const wallet of backup) {
        try {
            const wallets = await getWallets()
            const matchedDefaultNameFormat = wallet.name.match(/Wallet (\d+)/)
            const index = matchedDefaultNameFormat?.[1]
            const name =
                wallet.name && !index
                    ? generateUniqueWalletName(wallets, wallet.name)
                    : generateNewWalletName(
                          wallets,
                          undefined,
                          index && !Number.isNaN(index) ? Number(index) : undefined,
                      )
            if (wallet.privateKey.isSome())
                await recoverWalletFromPrivateKey(
                    name,
                    await JWKToKey(wallet.privateKey.value, 'private'),
                    wallet.mnemonicId.unwrapOr(undefined),
                    wallet.derivationPath.unwrapOr(undefined),
                )
            else if (wallet.mnemonic.isSome()) {
                // fix a backup bug of pre-v2.2.2 versions
                const accounts = await getDerivableAccounts(wallet.mnemonic.value.words, 1, 5)
                const index = accounts.findIndex(currySameAddress(wallet.address))
                await recoverWalletFromMnemonicWords(
                    name,
                    wallet.mnemonic.value.words,
                    index > -1 ? `${HD_PATH_WITHOUT_INDEX_ETHEREUM}/${index}` : wallet.mnemonic.value.path,
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
