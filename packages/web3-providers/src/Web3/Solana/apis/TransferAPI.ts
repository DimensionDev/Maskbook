import { PublicKey, SystemProgram, Transaction, sendAndConfirmRawTransaction } from '@solana/web3.js'
import { getOrCreateAssociatedTokenAccount } from './spl-token/getOrCreateAssociatedTokenAccount.js'
import { createTransferInstruction } from './spl-token/createTransferInstructions.js'
import { SolanaWeb3API } from './Web3API.js'
import { SolanaConnectionOptionsAPI } from './ConnectionOptionsAPI.js'
import type { SolanaConnectionOptions } from '../types/index.js'

export class SolanaTransferAPI {
    constructor(private options?: SolanaConnectionOptions) {
        this.Web3 = new SolanaWeb3API(this.options)
        this.ConnectionOptions = new SolanaConnectionOptionsAPI(this.options)
    }
    private Web3
    private ConnectionOptions
    private async attachRecentBlockHash(transaction: Transaction, initial?: SolanaConnectionOptions) {
        const connection = this.Web3.getWeb3Connection(initial)
        const blockHash = await connection.getRecentBlockhash()
        transaction.recentBlockhash = blockHash.blockhash
        return transaction
    }

    private async signTransaction(transaction: Transaction, initial?: SolanaConnectionOptions) {
        return this.Web3.getProviderInstance(initial).signTransaction(transaction)
    }

    private async sendTransaction(transaction: Transaction, initial?: SolanaConnectionOptions) {
        const signedTransaction = await this.signTransaction(transaction)
        return sendAndConfirmRawTransaction(this.Web3.getWeb3Connection(initial), signedTransaction.serialize())
    }

    async transferSol(recipient: string, amount: string, initial?: SolanaConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        if (!options.account) throw new Error('No payer provides.')
        const payerPubkey = new PublicKey(options.account)
        const recipientPubkey = new PublicKey(recipient)
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: payerPubkey,
                toPubkey: recipientPubkey,
                lamports: Number.parseInt(amount, 10),
            }),
        )
        transaction.feePayer = payerPubkey
        await this.attachRecentBlockHash(transaction)
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

        const payerPubkey = new PublicKey(options.account)
        const recipientPubkey = new PublicKey(recipient)
        const mintPubkey = new PublicKey(address)
        const signTransaction = this.signTransaction.bind(this)
        const connection = this.Web3.getWeb3Connection(options)
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
        const transaction = new Transaction().add(
            createTransferInstruction(
                formatTokenAccount.address,
                toTokenAccount.address,
                payerPubkey,
                Number.parseInt(amount, 10),
            ),
        )
        const blockHash = await connection.getLatestBlockhash()
        transaction.feePayer = payerPubkey
        transaction.recentBlockhash = blockHash.blockhash
        return this.sendTransaction(transaction)
    }
}
