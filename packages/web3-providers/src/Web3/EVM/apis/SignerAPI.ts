import defer * as _metamask_eth_sig_util from '@metamask/eth-sig-util'
import { signTransaction } from '@masknet/web3-shared-evm'
import { type SignMessage, SignType, toHex } from '@masknet/shared-base'
import { unreachable } from '@masknet/kit'
import type { Hex } from 'viem'

export class Signer {
    static async sign({ type, data }: SignMessage, key: Buffer<ArrayBuffer>): Promise<string> {
        switch (type) {
            case SignType.Message:
                return _metamask_eth_sig_util.personalSign({
                    privateKey: key,
                    data,
                })
            case SignType.TypedData:
                return _metamask_eth_sig_util.signTypedData({
                    privateKey: key,
                    data: JSON.parse(data),
                    version: _metamask_eth_sig_util.SignTypedDataVersion.V4,
                })
            case SignType.Transaction:
                const transaction = data

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
