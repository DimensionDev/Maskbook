import * as SolanaWeb3 from /* webpackDefer: true */ '@solana/web3.js'
import { encode } from 'bs58'

export function recoverTransaction(
    transaction: SolanaWeb3.Transaction | SolanaWeb3.VersionedTransaction,
    messageArgs: SolanaWeb3.MessageArgs | SolanaWeb3.MessageV0Args,
    signatures: Uint8Array[],
): SolanaWeb3.Transaction | SolanaWeb3.VersionedTransaction {
    if ('serializeMessage' in transaction) {
        const args = messageArgs as SolanaWeb3.MessageArgs
        return SolanaWeb3.Transaction.populate(
            new SolanaWeb3.Message(args),
            signatures.map((x) => encode(x)),
        )
    } else {
        const args = messageArgs as SolanaWeb3.MessageV0Args
        const msg = new SolanaWeb3.MessageV0({
            ...args,
            staticAccountKeys: args.staticAccountKeys?.map((x) => new SolanaWeb3.PublicKey(x)),
        })
        const message = SolanaWeb3.VersionedMessage.deserialize(msg.serialize())
        return new SolanaWeb3.VersionedTransaction(message, signatures)
    }
}

export function recoverTransactionFromUnit8Array(
    signedTransaction: Uint8Array,
    transaction: SolanaWeb3.Transaction | SolanaWeb3.VersionedTransaction,
) {
    if ('serializeMessage' in transaction) {
        return SolanaWeb3.Transaction.from(signedTransaction)
    }

    return SolanaWeb3.VersionedTransaction.deserialize(signedTransaction)
}
