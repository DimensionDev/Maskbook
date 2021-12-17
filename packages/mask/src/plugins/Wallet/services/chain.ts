import { throttle } from 'lodash-unified'
import { BalanceOfChains, BlockNumberOfChains, ProviderType } from '@masknet/web3-shared-evm'
import { pollingTask } from '@masknet/shared-base'
import { getBalance, getBlockNumber, resetAllNonce } from '../../../extension/background-script/EthereumService'
import { startEffects } from '../../../../utils-pure'
import { UPDATE_CHAIN_STATE_DELAY } from '../constants'
import { currentBlockNumbersSettings, currentBalancesSettings } from '../settings'
import { currentChainIdSettings, currentAccountSettings, currentProviderSettings } from '../../../settings/settings'

let beats = 0
const { run } = startEffects(import.meta.webpackHot)

const currentChainIds = [...Object.values(currentChainIdSettings)]
const currentAccounts = [...Object.values(currentAccountSettings)]
const currentProviders = [...Object.values(currentProviderSettings)]

export async function updateBalances(updates: BalanceOfChains) {
    currentBalancesSettings.value = {
        ...currentBalancesSettings.value,
        ...updates,
    }
}

export async function updateBlockNumbers(updates: BlockNumberOfChains) {
    currentBlockNumbersSettings.value = {
        ...currentBlockNumbersSettings.value,
        ...updates,
    }
}

export async function kickToUpdateChainState() {
    beats += 1
}

export async function updateChainState() {
    // reset the polling task cause it will be called from service call
    resetPoolTask()

    // forget those passed beats
    beats = 0

    // update chain state
    try {
        const chainIds = currentChainIds.map((x) => x.value)
        const accounts = currentAccounts.map((x) => x.value)
        const providers = currentProviders.map((x) => x.value)
        const overrides = chainIds.map((_, index) => ({
            chainId: chainIds[index],
            provider: providers[index],
        }))

        // TODO:
        // reduce rpc requests
        const allSettled = await Promise.allSettled(
            chainIds.map(async (_, index) => {
                const [balance, blockNumber] = await Promise.all([
                    getBalance(accounts[index], overrides[index]),
                    getBlockNumber(overrides[index]),
                ])
                return {
                    chainId: chainIds[index],
                    provider: providers[index],
                    balance,
                    blockNumber,
                }
            }),
        )

        const { balances, blockNumbers } = allSettled.reduce(
            (
                updates: {
                    balances: BalanceOfChains
                    blockNumbers: BlockNumberOfChains
                },
                result,
            ) => {
                if (result.status === 'rejected') return updates
                const { chainId, balance, blockNumber } = result.value
                return {
                    balances: {
                        ...updates.balances,
                        [chainId]: balance,
                    },
                    blockNumbers: {
                        ...updates.blockNumbers,
                        [chainId]: blockNumber,
                    },
                }
            },
            { balances: {}, blockNumbers: {} },
        )

        currentBalancesSettings.value = balances
        currentBlockNumbersSettings.value = blockNumbers
    } catch {
        // do nothing
    } finally {
        // reset the polling if chain state updated successfully
        resetPoolTask()
    }
}

export const updateChainStateThrottled = throttle(updateChainState, 300, {
    leading: false,
    trailing: true,
})

let resetPoolTask: () => void = () => {}

// poll the newest chain state
run(() => {
    const { reset, cancel } = pollingTask(
        async () => {
            if (beats <= 0) return false
            await updateChainState()
            return false
        },
        {
            delay: UPDATE_CHAIN_STATE_DELAY,
        },
    )
    resetPoolTask = reset
    return cancel
})

// revalidate chain state if the chainId of current provider was changed
currentChainIds.forEach((settings, index) => {
    run(() =>
        settings.addListener(() => {
            updateChainStateThrottled()
            if (currentProviders[index].value === ProviderType.MaskWallet) resetAllNonce()
        }),
    )
})

// revalidate chain state if the current wallet was changed
currentAccounts.forEach((settings) => {
    run(() => settings.addListener(() => updateChainStateThrottled()))
})
