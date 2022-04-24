import * as ABICoder from 'web3-eth-abi'
import type { Plugin } from '@masknet/plugin-infra'
import { TransactionDescriptorType, TransactionFormatterState, Web3Plugin } from '@masknet/plugin-infra/web3'
import { isZero } from '@masknet/web3-shared-base'
import {
    ChainId,
    EthereumTransactionConfig,
    getData,
    getFunctionParameters,
    getTo,
    getTransactionSignature,
    isEmptyHex,
    isSameAddress,
    isZeroAddress,
} from '@masknet/web3-shared-evm'
import { readABI } from './TransactionFormatter/abi'
import { createConnection } from './Protocol/connection'
import type { TransactionDescriptor } from './TransactionFormatter/types'

// built-in descriptors
import { TransferTokenDescriptor } from './TransactionFormatter/descriptors/TransferToken'
import { ContractDepolymentDescriptor } from './TransactionFormatter/descriptors/ContractDeployment'
import { CancelDescriptor } from './TransactionFormatter/descriptors/Cancel'
import { BaseTransactionDescriptor } from './TransactionFormatter/descriptors/Base'
import { ITODescriptor } from './TransactionFormatter/descriptors/ITO'
import { RedPacketDescriptor } from './TransactionFormatter/descriptors/RedPacket'
import { ERC20Descriptor } from './TransactionFormatter/descriptors/ERC20'

export class TransactionFormatter
    extends TransactionFormatterState<ChainId, string | undefined, EthereumTransactionConfig>
    implements
        Web3Plugin.ObjectCapabilities.TransactionFormatterState<ChainId, string | undefined, EthereumTransactionConfig>
{
    private coder = ABICoder as unknown as ABICoder.AbiCoder
    private connection = createConnection()
    private descriptors: Record<TransactionDescriptorType, TransactionDescriptor[]> = {
        [TransactionDescriptorType.TRANSFER]: [new TransferTokenDescriptor()],
        [TransactionDescriptorType.INTERACTION]: [
            new ITODescriptor(),
            new RedPacketDescriptor(),
            new ERC20Descriptor(),
            new BaseTransactionDescriptor(),
        ],
        [TransactionDescriptorType.DEPLOYMENT]: [new ContractDepolymentDescriptor()],
        [TransactionDescriptorType.RETRY]: [],
        [TransactionDescriptorType.CANCEL]: [new CancelDescriptor()],
    }

    constructor(context: Plugin.Shared.SharedContext) {
        super(context)
    }

    override async createContext(
        chainId: ChainId,
        transaction: EthereumTransactionConfig,
    ): Promise<Web3Plugin.TransactionContext<ChainId, string | undefined>> {
        const from = (transaction.from as string | undefined) ?? ''
        const value = (transaction.value as string | undefined) ?? '0x0'
        const data = getData(transaction)
        const to = getTo(transaction)
        const signature = getTransactionSignature(transaction)
        const parameters = getFunctionParameters(transaction)

        const context = {
            chainId,
            from,
            to,
            value,
        }

        if (data) {
            // contract interaction
            const abi = readABI(signature)

            if (abi) {
                try {
                    return {
                        ...context,
                        type: TransactionDescriptorType.INTERACTION,
                        name: abi.name,
                        parameters: this.coder.decodeParameters(abi.parameters, parameters ?? ''),
                    }
                } catch {
                    // do nothing
                }
            }

            // contract deployment
            if (isZeroAddress(to)) {
                return {
                    ...context,
                    type: TransactionDescriptorType.DEPLOYMENT,
                    code: data,
                }
            }
        }

        if (to) {
            let code = ''
            try {
                code = await this.connection.getCode(to)
            } catch {
                code = ''
            }

            // cancel tx
            if (isSameAddress(from, to) && isZero(value)) {
                return { ...context, type: TransactionDescriptorType.CANCEL }
            }

            // send ether
            if (isEmptyHex(code)) {
                return { ...context, type: TransactionDescriptorType.TRANSFER }
            } else {
                return { ...context, type: TransactionDescriptorType.INTERACTION }
            }
        }

        throw new Error('Failed to format transaction.')
    }

    override async createDescriptor(
        chainId: ChainId,
        transaction: EthereumTransactionConfig,
        context: Web3Plugin.TransactionContext<ChainId, string | undefined>,
    ): Promise<Web3Plugin.TransactionDescriptor<EthereumTransactionConfig>> {
        for (const descriptor of this.descriptors[context.type]) {
            const computed = await descriptor.compute(context)

            if (computed)
                return {
                    ...computed,
                    type: context.type,
                    _tx: transaction,
                }
        }

        throw new Error('Failed to computed transaction descriptor.')
    }
}
