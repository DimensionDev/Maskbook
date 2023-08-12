import { Web3 } from '@masknet/web3-providers'
import type { RecentTransaction } from '@masknet/web3-shared-base'
import {
    ProviderType,
    formatWeiToGwei,
    type ChainId,
    type Transaction as EvmTransaction,
} from '@masknet/web3-shared-evm'
import { mapKeys } from 'lodash-es'
import { toHex } from 'web3-utils'
import { GasSettingModal } from '../../modals/modals.js'
import { ReplaceType } from './type.js'

export async function modifyTransaction(
    transaction: RecentTransaction<ChainId, EvmTransaction>,
    replaceType: ReplaceType,
) {
    const candidate = transaction.candidates[transaction.indexId]
    if (!candidate) return
    const oldGasSettings = {
        gas: candidate.gas!,
        gasPrice: candidate.gasPrice ? formatWeiToGwei(candidate.gasPrice).toFixed() : undefined,
        maxFeePerGas: candidate.maxFeePerGas ? formatWeiToGwei(candidate.maxFeePerGas).toFixed() : undefined,
        maxPriorityFeePerGas: candidate.maxPriorityFeePerGas
            ? formatWeiToGwei(candidate.maxPriorityFeePerGas).toFixed()
            : undefined,
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
        ...mapKeys(gasSettings, (value) => (typeof value === 'undefined' ? value : toHex(value))),
    }
    if (replaceType === ReplaceType.CANCEL) {
        await Web3.cancelTransaction(transaction.id, newConfig, {
            providerType: ProviderType.MaskWallet,
        })
    } else {
        await Web3.replaceTransaction(transaction.id, newConfig, {
            providerType: ProviderType.MaskWallet,
        })
    }
}
