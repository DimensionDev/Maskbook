import { mapKeys } from 'lodash-es'
import type { BigNumber } from 'bignumber.js'
import * as web3_utils from /* webpackDefer: true */ 'web3-utils'
import type { AbiItem } from 'web3-utils'
import { EVMWeb3 } from '@masknet/web3-providers'
import ERC20_ABI from '@masknet/web3-contracts/abis/ERC20.json' with { type: 'json' }
import { toFixed, type RecentTransaction } from '@masknet/web3-shared-base'
import {
    ProviderType,
    formatWeiToGwei,
    type ChainId,
    type Transaction as EvmTransaction,
    decodeFunctionParams,
} from '@masknet/web3-shared-evm'
import { ReplaceType, type GasSetting } from './type.js'
import { GasSettingModal } from '../../modals/modal-controls.js'

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
        ...mapKeys(gasSettings, (value) => (typeof value === 'undefined' ? value : web3_utils.toHex(value))),
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
export function parseReceiverFromERC20TransferInput(input?: string) {
    if (!input) return ''
    try {
        const decodedInputParams = decodeFunctionParams(ERC20_ABI as AbiItem[], input, 'transfer')
        return decodedInputParams[0] as string
    } catch {
        return ''
    }
}

// The Debank transaction history api does not return the input data and approved token info,
//  so can not do the decoding within its scope.
export function parseAmountFromERC20ApproveInput(input?: string) {
    if (!input) return
    try {
        const decodedInputParam = decodeFunctionParams(ERC20_ABI as AbiItem[], input, 'approve')
        const result = (decodedInputParam[1] as BigNumber).toString()
        return MaxUint256 === result ? 'Infinite' : result
    } catch {
        return
    }
}
