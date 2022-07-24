import type { NormalizedBackup } from '@masknet/backup-format'
import { currySameAddress, HD_PATH_WITHOUT_INDEX_ETHEREUM } from '@masknet/web3-shared-base'
import { concatArrayBuffer } from '@dimensiondev/kit'
import { ec as EC } from 'elliptic'
import { fromBase64URL, EC_JsonWebKey, isSecp256k1Point, isSecp256k1PrivateKey } from '@masknet/shared-base'
import { provider } from './internal_wallet'

export async function internal_wallet_restore(backup: NormalizedBackup.WalletBackup[]) {
    const password = await provider.INTERNAL_getPasswordRequired()
    for (const wallet of backup) {
        try {
            const name = wallet.name

            if (wallet.privateKey.some)
                await provider.recoverWalletFromPrivateKey(
                    name,
                    await JWKToKey(wallet.privateKey.val, 'private'),
                    password,
                )
            else if (wallet.mnemonic.some) {
                // fix a backup bug of pre-v2.2.2 versions
                const accounts = await provider.getDerivableAccounts(wallet.mnemonic.val.words, 1, 5)
                const index = accounts.findIndex(currySameAddress(wallet.address))
                await provider.recoverWalletFromMnemonic(
                    name,
                    wallet.mnemonic.val.words,
                    index > -1 ? `${HD_PATH_WITHOUT_INDEX_ETHEREUM}/${index}` : wallet.mnemonic.val.path,
                    password,
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
        const point = new Uint8Array(concatArrayBuffer(new Uint8Array([0x04]), xb, yb))
        if (await isSecp256k1Point(point)) return `0x${ec.keyFromPublic(point).getPublic(false, 'hex')}`
    }
    if (type === 'private' && jwk.d) {
        const db = fromBase64URL(jwk.d)
        if (await isSecp256k1PrivateKey(db)) return `0x${ec.keyFromPrivate(db).getPrivate('hex')}`
    }
    throw new Error('invalid private key')
}
