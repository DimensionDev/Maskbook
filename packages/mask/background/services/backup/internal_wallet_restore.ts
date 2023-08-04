import { ec as EC } from 'elliptic'
import { concatArrayBuffer } from '@masknet/kit'
import type { NormalizedBackup } from '@masknet/backup-format'
import { currySameAddress, HD_PATH_WITHOUT_INDEX_ETHEREUM } from '@masknet/web3-shared-base'
import { fromBase64URL, type EC_JsonWebKey, isK256Point, isK256PrivateKey } from '@masknet/shared-base'
import { WalletServiceRef } from '@masknet/plugin-infra/dom'

export async function internal_wallet_restore(backup: NormalizedBackup.WalletBackup[]) {
    for (const wallet of backup) {
        try {
            const wallets = await WalletServiceRef.value.getWallets()
            const nameExists = wallets.some((x) => x.name === wallet.name)
            const name = nameExists ? `Wallet ${wallets.length + 1}` : wallet.name

            if (wallet.privateKey.some)
                await WalletServiceRef.value.recoverWalletFromPrivateKey(
                    name,
                    await JWKToKey(wallet.privateKey.val, 'private'),
                )
            else if (wallet.mnemonic.some) {
                // fix a backup bug of pre-v2.2.2 versions
                const accounts = await WalletServiceRef.value.getDerivableAccounts(wallet.mnemonic.val.words, 1, 5)
                const index = accounts.findIndex(currySameAddress(wallet.address))
                await WalletServiceRef.value.recoverWalletFromMnemonicWords(
                    name,
                    wallet.mnemonic.val.words,
                    index > -1 ? `${HD_PATH_WITHOUT_INDEX_ETHEREUM}/${index}` : wallet.mnemonic.val.path,
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
