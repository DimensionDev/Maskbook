import { SignTypedDataVersion, personalSign, signTypedData } from '@metamask/eth-sig-util'
import type { Transaction } from '@masknet/web3-shared-evm'
import { SignType, toHex } from '@masknet/shared-base'
import { ConnectionAPI } from './ConnectionAPI.js'
import type { SignerAPI_Base } from '../../../entry-types.js'

export class SignerAPI implements SignerAPI_Base.Provider {
    private Web3 = new ConnectionAPI()

    async sign<T>(type: SignType, key: Buffer, message: T): Promise<string> {
        switch (type) {
            case SignType.Message:
                return personalSign({
                    privateKey: key,
                    data: message as string,
                })
            case SignType.TypedData:
                return signTypedData({
                    privateKey: key,
                    data: JSON.parse(message as string),
                    version: SignTypedDataVersion.V4,
                })
            case SignType.Transaction:
                const transaction = message as Transaction

                const chainId = transaction.chainId
                if (!chainId) throw new Error('Invalid chain id.')

                const web3 = this.Web3.getWeb3({
                    chainId,
                })
                const { rawTransaction } = await web3.eth.accounts.signTransaction(transaction, toHex(key))
                if (!rawTransaction) throw new Error('Failed to sign transaction.')

                return rawTransaction
            default:
                throw new Error(`Unknown sign type: ${type}.`)
        }
    }
}
