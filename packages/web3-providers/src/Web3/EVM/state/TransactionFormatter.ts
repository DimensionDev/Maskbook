import {
    type TransactionContext,
    type TransactionDescriptor as TransactionDescriptorBase,
    TransactionDescriptorType,
} from '@masknet/web3-shared-base'
import {
    abiCoder,
    AccountTransaction,
    type ChainId,
    isEmptyHex,
    isZeroAddress,
    type Transaction,
    type TransactionParameter,
} from '@masknet/web3-shared-evm'
import { readABIs } from './TransactionFormatter/abi.js'
import type { TransactionDescriptorFormatter } from './TransactionFormatter/types.js'

// built-in descriptors
import { TransferTokenDescriptor } from './TransactionFormatter/descriptors/TransferToken.js'
import { ContractDeploymentDescriptor } from './TransactionFormatter/descriptors/ContractDeployment.js'
import { CancelDescriptor } from './TransactionFormatter/descriptors/Cancel.js'
import { BaseDescriptor } from './TransactionFormatter/descriptors/Base.js'
import { GitcoinDescriptor } from './TransactionFormatter/descriptors/Gitcoin.js'
import { MaskBoxDescriptor } from './TransactionFormatter/descriptors/MaskBox.js'
import { RedPacketDescriptor } from './TransactionFormatter/descriptors/RedPacket.js'
import { ERC20Descriptor } from './TransactionFormatter/descriptors/ERC20.js'
import { ERC721Descriptor } from './TransactionFormatter/descriptors/ERC721.js'
import { SavingsDescriptor } from './TransactionFormatter/descriptors/Savings.js'
import { SmartPayDescriptor } from './TransactionFormatter/descriptors/SmartPay.js'
import { LensDescriptor } from './TransactionFormatter/descriptors/Lens.js'
import { AirdropDescriptor } from './TransactionFormatter/descriptors/Airdrop.js'
import { TransactionFormatterState } from '../../Base/state/TransactionFormatter.js'
import { EVMWeb3Readonly } from '../apis/ConnectionReadonlyAPI.js'

export class EVMTransactionFormatter extends TransactionFormatterState<ChainId, TransactionParameter, Transaction> {
    private descriptors: Record<TransactionDescriptorType, TransactionDescriptorFormatter[]> = {
        [TransactionDescriptorType.TRANSFER]: [new TransferTokenDescriptor()],
        [TransactionDescriptorType.INTERACTION]: [
            new AirdropDescriptor(),
            new LensDescriptor(),
            new SavingsDescriptor(),
            new GitcoinDescriptor(),
            new MaskBoxDescriptor(),
            new RedPacketDescriptor(),
            new SmartPayDescriptor(),
            new ERC20Descriptor(),
            new ERC721Descriptor(),
            new BaseDescriptor(),
        ],
        [TransactionDescriptorType.DEPLOYMENT]: [new ContractDeploymentDescriptor()],
        [TransactionDescriptorType.RETRY]: [],
        [TransactionDescriptorType.CANCEL]: [new CancelDescriptor()],
    }
    override async createContext(
        chainId: ChainId,
        transaction: Transaction,
        hash?: string,
    ): Promise<TransactionContext<ChainId>> {
        const { from, value, data, to, functionSignature, functionParameters } = new AccountTransaction(transaction)
        const context: TransactionContext<ChainId> = {
            type: TransactionDescriptorType.INTERACTION,
            chainId,
            from,
            to,
            value,
            hash,
        }

        if (data) {
            // contract interaction
            const abis = readABIs(functionSignature)

            if (abis?.length) {
                try {
                    return {
                        ...context,
                        type: TransactionDescriptorType.INTERACTION,
                        methods: abis.map((x) => ({
                            name: x.name,
                            parameters: abiCoder.decodeParameters(x.parameters, functionParameters ?? ''),
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
                code = await EVMWeb3Readonly.getCode(to, { chainId })
            } catch {}

            // send ether tx
            if (isEmptyHex(code)) {
                return { ...context, type: TransactionDescriptorType.TRANSFER }
            }

            return { ...context, type: TransactionDescriptorType.INTERACTION }
        }

        throw new Error('Failed to format transaction.')
    }

    override async createDescriptor(
        chainId: ChainId,
        transaction: Transaction,
        context: TransactionContext<ChainId, TransactionParameter>,
    ): Promise<TransactionDescriptorBase<ChainId, Transaction, TransactionParameter>> {
        for (const descriptor of this.descriptors[context.type]) {
            const computed = await descriptor.compute(context)

            if (computed)
                return {
                    ...computed,
                    context,
                    chainId,
                    type: context.type,
                    _tx: transaction,
                }
        }

        throw new Error('Failed to computed transaction descriptor.')
    }
}
