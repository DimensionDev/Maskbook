import * as SolanaWeb3 from /* webpackDefer: true */ '@solana/web3.js'
import { getOrCreateAssociatedTokenAccount } from './spl-token/getOrCreateAssociatedTokenAccount.js'
import { createTransferInstruction } from './spl-token/createTransferInstructions.js'
import { SolanaWeb3API } from './Web3API.js'
import { SolanaConnectionOptionsAPI } from './ConnectionOptionsAPI.js'
import type { SolanaConnectionOptions } from '../types/index.js'
import type { Transaction } from '@masknet/web3-shared-solana'

export class SolanaTransferAPI {
    constructor(private options?: SolanaConnectionOptions) {
        this.Web3 = new SolanaWeb3API(this.options)
        this.ConnectionOptions = new SolanaConnectionOptionsAPI(this.options)
    }
    private Web3
    private ConnectionOptions

    private async signTransaction(transaction: Transaction, initial?: SolanaConnectionOptions) {
        return this.Web3.getProviderInstance(initial).signTransaction(transaction)
    }

    private async sendTransaction(transaction: Transaction, initial?: SolanaConnectionOptions) {
        const signedTransaction = await this.signTransaction(transaction)
        return SolanaWeb3.sendAndConfirmRawTransaction(
            this.Web3.getConnection(initial),
            signedTransaction.serialize() as Buffer,
        )
    }

    async transferSol(recipient: string, amount: string, initial?: SolanaConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        if (!options.account) throw new Error('No payer provides.')
        const payerPubkey = new SolanaWeb3.PublicKey(options.account)
        const recipientPubkey = new SolanaWeb3.PublicKey(recipient)
        const blockHash = await this.Web3.getConnection(initial).getLatestBlockhash()
        const message = new SolanaWeb3.TransactionMessage({
            payerKey: payerPubkey,
            recentBlockhash: blockHash.blockhash,
            instructions: [
                SolanaWeb3.SystemProgram.transfer({
                    fromPubkey: payerPubkey,
                    toPubkey: recipientPubkey,
                    lamports: Number.parseInt(amount, 10),
                }),
            ],
        }).compileToV0Message()
        const transaction = new SolanaWeb3.VersionedTransaction(message)
        return this.sendTransaction(transaction)
    }

    async transferSplToken(
        address: string,
        recipient: string,
        amount: string,
        initial?: SolanaConnectionOptions,
    ): Promise<string> {
        const options = this.ConnectionOptions.fill(initial)
        if (!options.account) throw new Error('No payer provides.')

        const payerPubkey = new SolanaWeb3.PublicKey(options.account)
        const recipientPubkey = new SolanaWeb3.PublicKey(recipient)
        const mintPubkey = new SolanaWeb3.PublicKey(address)
        const signTransaction = this.signTransaction.bind(this)
        const connection = this.Web3.getConnection(options)
        const formatTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            payerPubkey,
            mintPubkey,
            payerPubkey,
            signTransaction,
        )
        const toTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            payerPubkey,
            mintPubkey,
            recipientPubkey,
            signTransaction,
        )
        const instruction = createTransferInstruction(
            formatTokenAccount.address,
            toTokenAccount.address,
            payerPubkey,
            Number.parseInt(amount, 10),
        )

        const blockHash = await this.Web3.getConnection(initial).getLatestBlockhash()
        const message = new SolanaWeb3.TransactionMessage({
            payerKey: payerPubkey,
            recentBlockhash: blockHash.blockhash,
            instructions: [instruction],
        }).compileToV0Message()
        const tx = new SolanaWeb3.VersionedTransaction(message)
        return this.sendTransaction(tx)
    }
}
