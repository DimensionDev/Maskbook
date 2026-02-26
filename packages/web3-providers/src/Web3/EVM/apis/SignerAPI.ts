import defer * as _metamask_eth_sig_util from '@metamask/eth-sig-util'
import { signTransaction } from '@masknet/web3-shared-evm'
import { SignType, toHex } from '@masknet/shared-base'
import { unreachable } from '@masknet/kit'
import type { Hex, TransactionSerializable } from 'viem'

export class Signer {
    static async sign(
        type: SignType.Message | SignType.TypedData,
        key: Buffer<ArrayBuffer>,
        message: string,
    ): Promise<string>
    static async sign(
        type: SignType.Transaction,
        key: Buffer<ArrayBuffer>,
        message: TransactionSerializable,
    ): Promise<string>
    static async sign(
        type: SignType,
        key: Buffer<ArrayBuffer>,
        message: string | TransactionSerializable,
    ): Promise<string> {
        switch (type) {
            case SignType.Message:
                return _metamask_eth_sig_util.personalSign({
                    privateKey: key,
                    data: message as string,
                })
            case SignType.TypedData:
                return _metamask_eth_sig_util.signTypedData({
                    privateKey: key,
                    data: JSON.parse(message as string),
                    version: _metamask_eth_sig_util.SignTypedDataVersion.V4,
                })
            case SignType.Transaction:
                const transaction = message as TransactionSerializable

                const chainId = transaction.chainId
                if (!chainId) throw new Error('Invalid chain id.')

                const rawTransaction = await signTransaction(transaction, toHex(key) as Hex)
                if (!rawTransaction) throw new Error('Failed to sign transaction.')
                return rawTransaction

            default:
                unreachable(type)
        }
    }
}
