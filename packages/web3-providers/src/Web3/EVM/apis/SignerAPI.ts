import * as _metamask_eth_sig_util from /* webpackDefer: true */ '@metamask/eth-sig-util'
import { signTransaction, type Transaction } from '@masknet/web3-shared-evm'
import { SignType, toHex } from '@masknet/shared-base'
import { unreachable } from '@masknet/kit'

export class Signer {
    static async sign(type: SignType, key: Buffer, message: unknown): Promise<string> {
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
                const transaction = message as Transaction

                const chainId = transaction.chainId
                if (!chainId) throw new Error('Invalid chain id.')

                const { rawTransaction } = await signTransaction(transaction, toHex(key))
                if (!rawTransaction) throw new Error('Failed to sign transaction.')
                return rawTransaction

            default:
                unreachable(type)
        }
    }
}
