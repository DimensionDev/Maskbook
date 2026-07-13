import { mapKeys } from 'lodash-es'
import { EVMWeb3 } from '@masknet/web3-providers'
import { ERC20Abi } from '@masknet/web3-contracts/types/ERC20.js'
import { toFixed, type RecentTransaction } from '@masknet/web3-shared-base'
import {
    decodeFunctionParams,
    ProviderType,
    formatWeiToGwei,
    type ChainId,
    type Transaction as EvmTransaction,
} from '@masknet/web3-shared-evm'
import { ReplaceType, type GasSetting } from './type.js'
import { GasSettingModal } from '../../modals/modal-controls.js'
import { toHex } from '@masknet/shared-base'

const MaxUint256 = toFixed('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')

export async function modifyTransaction(
    transaction: RecentTransaction<ChainId, EvmTransaction>,
    replaceType: ReplaceType,
) {
    const candidate = transaction.candidates[transaction.indexId]
    if (!candidate) return
    const oldGasSettings: GasSetting = {
        gasLimit: candidate.gas,
        gasPrice: candidate.gasPrice ? formatWeiToGwei(candidate.gasPrice).toFixed() : undefined,
        maxFeePerGas: candidate.maxFeePerGas ? formatWeiToGwei(candidate.maxFeePerGas).toFixed() : undefined,
        maxPriorityFeePerGas:
            candidate.maxPriorityFeePerGas ? formatWeiToGwei(candidate.maxPriorityFeePerGas).toFixed() : undefined,
    }
    const gasSettings = await GasSettingModal.openAndWaitForClose({
        chainId: transaction.chainId,
        config: oldGasSettings,
        nonce: candidate.nonce!,
        replaceType,
    })
    if (!gasSettings) return
    const newConfig = {
        ...candidate,
        ...oldGasSettings,
        ...mapKeys(gasSettings, (value) => (value === undefined ? value : toHex(value))),
    }
    if (replaceType === ReplaceType.CANCEL) {
        await EVMWeb3.cancelTransaction(transaction.id, newConfig, {
            providerType: ProviderType.MaskWallet,
        })
    } else {
        await EVMWeb3.replaceTransaction(transaction.id, newConfig, {
            providerType: ProviderType.MaskWallet,
        })
    }
}

// The Debank transaction history api does not return the input data,
//  so can not do the decoding within its scope.
export function parseReceiverFromERC20TransferInput(input?: string | null) {
    if (!input) return ''
    try {
        const decodedInputParams = decodeFunctionParams(ERC20Abi, input as `0x${string}`, 'transfer')
        return decodedInputParams[0]
    } catch {
        return ''
    }
}

// The Debank transaction history api does not return the input data and approved token info,
//  so can not do the decoding within its scope.
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export function parseAmountFromERC20ApproveInput(input?: string | null): 'Infinite' | string | undefined {
    if (!input) return
    try {
        const decodedInputParam = decodeFunctionParams(ERC20Abi, input as `0x${string}`, 'approve')
        const result = decodedInputParam[1].toString()
        return MaxUint256 === result ? 'Infinite' : result
    } catch {
        return
    }
}
