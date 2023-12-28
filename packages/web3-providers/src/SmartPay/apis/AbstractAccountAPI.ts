import { first } from 'lodash-es'
import type { ECKeyIdentifier } from '@masknet/shared-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import {
    type ChainId,
    type Transaction,
    type UserOperation,
    type Signer,
    getSmartPayConstants,
    isEmptyHex,
    isValidAddress,
} from '@masknet/web3-shared-evm'
import { EVMRequestReadonly } from '../../Web3/EVM/apis/RequestReadonlyAPI.js'
import { SmartPayBundler } from './BundlerAPI.js'
import { SmartPayOwner } from './OwnerAPI.js'
import { ContractWallet } from '../libs/ContractWallet.js'
import { UserTransaction } from '../libs/UserTransaction.js'
import type { AbstractAccountAPI } from '../../entry-types.js'

class SmartPayAccountAPI implements AbstractAccountAPI.Provider<ChainId, UserOperation, Transaction> {
    private async getEntryPoint(chainId: ChainId) {
        const entryPoints = await SmartPayBundler.getSupportedEntryPoints(chainId)
        const entryPoint = first(entryPoints)
        if (!entryPoint || !isValidAddress(entryPoint)) throw new Error(`Not supported ${chainId}`)
        return entryPoint
    }

    private async getInitCode(chainId: ChainId, owner: string) {
        const contractWallet = await this.createContractWallet(chainId, owner)
        if (isEmptyHex(contractWallet.initCode)) throw new Error('Failed to create initCode.')
        return contractWallet.initCode
    }

    private async createContractWallet(chainId: ChainId, owner: string) {
        if (!owner) throw new Error('No owner address.')
        return new ContractWallet(
            chainId,
            owner,
            getSmartPayConstants(chainId).LOGIC_WALLET_CONTRACT_ADDRESS ?? '',
            await this.getEntryPoint(chainId),
        )
    }

    /**
     * The internal method to send a UserTransaction.
     */
    private async sendUserTransaction(
        chainId: ChainId,
        owner: string,
        userTransaction: UserTransaction,
        signer: Signer<ECKeyIdentifier> | Signer<string>,
    ) {
        const getOverrides = async () => {
            if (isEmptyHex(userTransaction.initCode) && userTransaction.nonce === 0) {
                const accounts = await SmartPayOwner.getAccountsByOwner(chainId, owner, false)
                const target = accounts.find((x) => isSameAddress(x.address, userTransaction.operation.sender))
                const accountsDeployed = accounts.filter((x) => isSameAddress(x.creator, owner) && x.deployed)

                // If the wallet to which the transaction is sent is obtained by changing the owner
                if (!target?.creator) {
                    return
                }

                if (!accountsDeployed.length) {
                    return {
                        initCode: await this.getInitCode(chainId, owner),
                        nonce: accountsDeployed.length,
                    }
                }
            }
            return
        }

        await userTransaction.fillUserOperation(EVMRequestReadonly.getWeb3({ chainId }), await getOverrides())
        return SmartPayBundler.sendUserOperation(chainId, await userTransaction.signUserOperation(signer))
    }

    private async estimateUserTransaction(chainId: ChainId, userTransaction: UserTransaction) {
        await userTransaction.fillUserOperation(EVMRequestReadonly.getWeb3({ chainId }))
        return userTransaction.estimateUserOperation()
    }

    async sendTransaction(
        chainId: ChainId,
        owner: string,
        transaction: Transaction,
        signer: Signer<ECKeyIdentifier> | Signer<string>,
        options?: AbstractAccountAPI.Options,
    ): Promise<string> {
        const entryPoint = await this.getEntryPoint(chainId)
        const userTransaction = UserTransaction.fromTransaction(chainId, entryPoint, transaction, options)
        return this.sendUserTransaction(chainId, owner, userTransaction, signer)
    }

    async sendUserOperation(
        chainId: ChainId,
        owner: string,
        operation: UserOperation,
        signer: Signer<ECKeyIdentifier> | Signer<string>,
        options?: AbstractAccountAPI.Options,
    ): Promise<string> {
        const entryPoint = await this.getEntryPoint(chainId)
        const userTransaction = UserTransaction.fromUserOperation(chainId, entryPoint, operation, options)
        return this.sendUserTransaction(chainId, owner, userTransaction, signer)
    }

    async estimateTransaction(
        chainId: ChainId,
        transaction: Transaction,
        options?: AbstractAccountAPI.Options,
    ): Promise<string> {
        const entryPoint = await this.getEntryPoint(chainId)
        const userTransaction = UserTransaction.fromTransaction(chainId, entryPoint, transaction, options)
        return this.estimateUserTransaction(chainId, userTransaction)
    }

    async estimateUserOperation(
        chainId: ChainId,
        operation: UserOperation,
        options?: AbstractAccountAPI.Options,
    ): Promise<string> {
        const entryPoint = await this.getEntryPoint(chainId)
        const userTransaction = UserTransaction.fromUserOperation(chainId, entryPoint, operation, options)
        return this.estimateUserTransaction(chainId, userTransaction)
    }

    async deploy(chainId: ChainId, owner: string, signer: Signer<ECKeyIdentifier> | Signer<string>): Promise<string> {
        if (!isValidAddress(owner)) throw new Error('Invalid owner address.')

        const initCode = await this.getInitCode(chainId, owner)
        const accounts = await SmartPayOwner.getAccountsByOwner(chainId, owner, false)
        const accountsDeployed = accounts.filter((x) => isSameAddress(x.creator, owner) && x.deployed)

        return this.sendUserOperation(
            chainId,
            owner,
            {
                initCode,
                nonce: accountsDeployed.length,
                sender: accounts[accountsDeployed.length].address,
            },
            signer,
        )
    }
}
export const SmartPayAccount = new SmartPayAccountAPI()
