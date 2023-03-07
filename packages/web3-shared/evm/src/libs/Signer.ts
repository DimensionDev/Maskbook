import { SignType } from '@masknet/web3-shared-base'
import type { Transaction } from '../types/index.js'

export class Signer<T> {
    constructor(
        private identifier: T,
        private sign: (type: SignType, message: string | Transaction, identifier: T) => Promise<string>,
    ) {}

    signMessage(message: string): Promise<string> {
        return this.sign(SignType.Message, message, this.identifier)
    }

    signTypedData(data: string): Promise<string> {
        return this.sign(SignType.TypedData, data, this.identifier)
    }

    signTransaction(transaction: Transaction): Promise<string> {
        return this.sign(SignType.Transaction, transaction, this.identifier)
    }
}
