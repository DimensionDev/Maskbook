import { compact } from 'lodash-unified'
import * as ABICoder from 'web3-eth-abi'
import type { Plugin } from '@masknet/plugin-infra'
import {
    isZero,
    isSameAddress,
    TransactionContext,
    TransactionDescriptor as TransactionDescriptorBase,
    TransactionDescriptorType,
} from '@masknet/web3-shared-base'
import { TransactionFormatterState } from '@masknet/web3-state'
import {
    ChainId,
    decodeUserOperations,
    getData,
    getFunctionParameters,
    getFunctionSignature,
    getSmartPayConstant,
    getTo,
    isEmptyHex,
    isZeroAddress,
    Transaction,
    TransactionParameter,
} from '@masknet/web3-shared-evm'
import { readABIs } from './TransactionFormatter/abi.js'
import { createConnection } from './Connection/connection.js'
import type { TransactionDescriptor } from './TransactionFormatter/types.js'

// built-in descriptors
import { TransferTokenDescriptor } from './TransactionFormatter/descriptors/TransferToken.js'
import { ContractDeploymentDescriptor } from './TransactionFormatter/descriptors/ContractDeployment.js'
import { CancelDescriptor } from './TransactionFormatter/descriptors/Cancel.js'
import { BaseTransactionDescriptor } from './TransactionFormatter/descriptors/Base.js'
import { ITODescriptor } from './TransactionFormatter/descriptors/ITO.js'
import { MaskBoxDescriptor } from './TransactionFormatter/descriptors/MaskBox.js'
import { RedPacketDescriptor } from './TransactionFormatter/descriptors/RedPacket.js'
import { ERC20Descriptor } from './TransactionFormatter/descriptors/ERC20.js'
import { ERC721Descriptor } from './TransactionFormatter/descriptors/ERC721.js'
import { SwapDescriptor } from './TransactionFormatter/descriptors/Swap.js'
import { SavingsDescriptor } from './TransactionFormatter/descriptors/Savings.js'

export class TransactionFormatter extends TransactionFormatterState<ChainId, TransactionParameter, Transaction> {
    private coder = ABICoder as unknown as ABICoder.AbiCoder
    private connection = createConnection()
    private descriptors: Record<TransactionDescriptorType, TransactionDescriptor[]> = {
        [TransactionDescriptorType.TRANSFER]: [new TransferTokenDescriptor()],
        [TransactionDescriptorType.INTERACTION]: [
            new SavingsDescriptor(),
            new ITODescriptor(),
            new MaskBoxDescriptor(),
            new RedPacketDescriptor(),
            new ERC20Descriptor(),
            new ERC721Descriptor(),
            new SwapDescriptor(),
            new BaseTransactionDescriptor(),
        ],
        [TransactionDescriptorType.DEPLOYMENT]: [new ContractDeploymentDescriptor()],
        [TransactionDescriptorType.RETRY]: [],
        [TransactionDescriptorType.CANCEL]: [new CancelDescriptor()],
    }

    constructor(context: Plugin.Shared.SharedContext) {
        super(context)
    }

    override async createContext(
        chainId: ChainId,
        transaction: Transaction,
        hash?: string,
    ): Promise<TransactionContext<ChainId, string | undefined>> {
        const from = (transaction.from as string | undefined) ?? ''
        const value = (transaction.value as string | undefined) ?? '0x0'
        const data = getData(transaction)
        const to = getTo(transaction)
        const signature = getFunctionSignature(transaction)
        const parameters = getFunctionParameters(transaction)

        const context: TransactionContext<ChainId, string | undefined> = {
            type: TransactionDescriptorType.INTERACTION,
            chainId,
            from,
            to,
            value,
            hash,
        }

        if (data) {
            // contract interaction
            const abis = readABIs(signature)

            if (abis?.length) {
                try {
                    return {
                        ...context,
                        type: TransactionDescriptorType.INTERACTION,
                        methods: abis.map((x) => ({
                            name: x.name,
                            parameters: this.coder.decodeParameters(x.parameters, parameters ?? ''),
                        })),
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
                code = await this.connection.getCode(to, { chainId })
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
            }

            // smart pay tx
            if (isSameAddress(to, getSmartPayConstant(chainId, 'EP_CONTRACT_ADDRESS'))) {
                const userOperations = decodeUserOperations(transaction)
                const allSettled = await Promise.allSettled(
                    userOperations.map((x) => {
                        return this.createContext(chainId, x)
                    }),
                )

                return {
                    ...context,
                    type: TransactionDescriptorType.INTERACTION,
                    children: compact<TransactionContext<ChainId, string | undefined>>(
                        allSettled.map((x) => (x.status === 'fulfilled' ? x.value : undefined)),
                    ),
                }
            }

            return { ...context, type: TransactionDescriptorType.INTERACTION }
        }

        throw new Error('Failed to format transaction.')
    }

    override async createDescriptor(
        chainId: ChainId,
        transaction: Transaction,
        context: TransactionContext<ChainId, TransactionParameter>,
    ): Promise<TransactionDescriptorBase<ChainId, Transaction>> {
        for (const descriptor of this.descriptors[context.type]) {
            const computed = await descriptor.compute(context)

            if (computed)
                return {
                    ...computed,
                    chainId,
                    type: context.type,
                    _tx: transaction,
                }
        }

        throw new Error('Failed to computed transaction descriptor.')
    }
}
