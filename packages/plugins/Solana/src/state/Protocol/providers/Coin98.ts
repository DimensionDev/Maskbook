import { first } from 'lodash-unified'
import type { Web3Plugin } from '@masknet/plugin-infra/web3'
import { ChainId, Coin98MethodType } from '@masknet/web3-shared-solana'
import type { SolanaProvider } from '../types'
import { BaseInjectedProvider } from './BaseInjected'
import type { PublicKey, Transaction } from '@solana/web3.js'

export class Coin98Provider extends BaseInjectedProvider implements SolanaProvider {
    constructor() {
        super(['coin98', 'sol'])
    }

    private get coin98() {
        if (!this.provider) throw new Error('No connection.')
        return this.provider
    }

    override async signMessage(dataToSign: string): Promise<string> {
        const { signature } = await this.coin98.request<{ signature: string }>({
            method: Coin98MethodType.SOL_SIGN,
            params: [new TextEncoder().encode(dataToSign)],
        })
        return signature
    }

    override async signTransaction(transaction: Transaction): Promise<Transaction> {
        const { signature, publicKey } = await this.coin98.request<{ signature: Buffer; publicKey: PublicKey }>({
            method: Coin98MethodType.SOL_SIGN,
            params: [transaction],
        })
        transaction.addSignature(publicKey, signature)
        return transaction
    }

    override async connect(chainId: ChainId): Promise<Web3Plugin.Account<ChainId>> {
        await this.readyPromise

        const accounts = await this.coin98.request<string[]>({
            method: Coin98MethodType.SOL_REQUEST_ACCOUNTS,
        })

        return {
            chainId,
            account: first(accounts) ?? '',
        }
    }
    override async disconnect() {
        // do nothing
    }
}
