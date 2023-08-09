import { Web3 } from '@masknet/web3-providers'
import type { RecentTransaction } from '@masknet/web3-shared-base'
import {
    ProviderType,
    type ChainId,
    type Transaction as EvmTransaction,
    formatWeiToGwei,
} from '@masknet/web3-shared-evm'
import { GasSettingModal } from '../../modals/modals.js'
import { ReplaceType } from './type.js'
// import { GasSettingModal } from '../../../modals/modals.js'
// import { ReplaceType } from '../type.js'

export async function modifyTransaction(
    transaction: RecentTransaction<ChainId, EvmTransaction>,
    replaceType: ReplaceType,
) {
    const candidate = transaction.candidates[transaction.indexId]
    if (!candidate) return
    const oldConfig = {
        gas: candidate.gas!,
        gasPrice: candidate.gasPrice,
        maxFeePerGas: candidate.maxFeePerGas ? formatWeiToGwei(candidate.maxFeePerGas).toFixed() : undefined,
        maxPriorityFeePerGas: candidate.maxPriorityFeePerGas
            ? formatWeiToGwei(candidate.maxPriorityFeePerGas).toFixed()
            : undefined,
    }
    const settings = await GasSettingModal.openAndWaitForClose({
        chainId: transaction.chainId,
        config: oldConfig,
        nonce: candidate.nonce!,
        replaceType,
    })
    if (!settings) return
    const newConfig = {
        ...oldConfig,
        ...settings,
    }
    if (replaceType === ReplaceType.CANCEL) {
        await Web3.cancelTransaction(transaction?.id, newConfig, {
            providerType: ProviderType.MaskWallet,
        })
    } else {
        await Web3.replaceTransaction(transaction?.id, newConfig, {
            providerType: ProviderType.MaskWallet,
        })
    }
}
