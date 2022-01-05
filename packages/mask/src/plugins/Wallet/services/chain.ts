import { throttle, DebouncedFunc, noop, uniq, uniqBy } from 'lodash-unified'
import { EthereumAddress } from 'wallet.ts'
import { getEnumAsArray } from '@dimensiondev/kit'
import { ChainId, ProviderType } from '@masknet/web3-shared-evm'
import { getBalance, getBlockNumber, resetAllNonce } from '../../../extension/background-script/EthereumService'
import { startEffects } from '../../../../utils-pure'
import {
    currentAccountSettings,
    currentMaskWalletAccountSettings,
    currentChainIdSettings,
    currentMaskWalletChainIdSettings,
    currentProviderSettings,
    currentBalanceOfChainSettings,
    currentBlockNumberOfChainSettings,
} from '../settings'

//#region updater
class Updater<T extends (...args: any[]) => Promise<void>> {
    private controller: AbortController | null = null
    private cache: Map<ChainId, DebouncedFunc<T>> = new Map()

    build(createUpdater: (signal: AbortSignal) => T) {
        this.controller?.abort()
        this.controller = new AbortController()

        const updater = createUpdater(this.controller.signal)

        getEnumAsArray(ChainId).forEach(({ value }) => {
            this.cache.set(
                value,
                throttle(updater, 30 * 1000, {
                    trailing: true,
                }),
            )
        })
    }

    update(chainId: ChainId, ...args: Parameters<T>) {
        return this.cache.get(chainId)?.(...args)
    }
}
//#endregion

const { run } = startEffects(import.meta.webpackHot)

const balanceUpdater = new Updater()
const blockNumberUpdater = new Updater()

const createBalanceUpdater = (signal: AbortSignal) => {
    let last = Date.now()

    return async function updateBalanceOfChain(chainId: ChainId, address: string) {
        if (!address || !EthereumAddress.isValid(address)) return
        const balance = await getBalance(address, {
            chainId,
            providerType: ProviderType.MaskWallet,
        })
        if (signal.aborted) return

        console.log(`DEBUG: updateBalanceOfChain ${chainId} after ${Date.now() - last}`)
        last = Date.now()

        currentBalanceOfChainSettings.value = {
            ...currentBalanceOfChainSettings.value,
            [chainId]: {
                ...currentBalanceOfChainSettings.value[chainId],
                [address.toLowerCase()]: balance,
            },
        }
    }
}

const createBlockNumberUpdater = (signal: AbortSignal) => {
    let last = Date.now()

    return async function updateBlockNumberOfChain(chainId: ChainId) {
        const blockNumber = await getBlockNumber({
            chainId,
        })
        if (signal.aborted) return

        console.log(`DEBUG: updateBlockNumberOfChain ${chainId} after ${Date.now() - last}`)
        last = Date.now()

        currentBlockNumberOfChainSettings.value = {
            ...currentBlockNumberOfChainSettings.value,
            [chainId]: blockNumber,
        }
    }
}

export function updateBlockNumber(chainId = currentChainIdSettings.value) {
    uniq([chainId, currentChainIdSettings.value, currentMaskWalletChainIdSettings.value]).forEach((chainId) => {
        blockNumberUpdater.update(chainId, chainId)
    })
}

export function updateBalance(chainId = currentChainIdSettings.value, account = currentAccountSettings.value) {
    const pairs = [
        [account, chainId] as const,
        [currentAccountSettings.value, currentChainIdSettings.value] as const,
        [currentMaskWalletAccountSettings.value, currentMaskWalletChainIdSettings.value] as const,
    ]
    uniqBy(pairs, ([account, chainId]) => `${account.toLowerCase()}_${chainId}`).forEach(([account, chainId]) => {
        balanceUpdater.update(chainId, chainId, account)
    })
}

run(() => {
    balanceUpdater.build(createBalanceUpdater)
    blockNumberUpdater.build(createBlockNumberUpdater)

    setInterval(() => {
        updateBalance()
        updateBlockNumber()
    }, 5000)
    return noop
})
run(() =>
    currentChainIdSettings.addListener(() => {
        balanceUpdater.build(createBalanceUpdater)
        blockNumberUpdater.build(createBlockNumberUpdater)
        if (currentProviderSettings.value === ProviderType.MaskWallet) resetAllNonce()
    }),
)
run(() =>
    currentMaskWalletChainIdSettings.addListener(() => {
        balanceUpdater.build(createBalanceUpdater)
        blockNumberUpdater.build(createBlockNumberUpdater)
        resetAllNonce()
    }),
)
run(() =>
    currentAccountSettings.addListener(() => {
        balanceUpdater.build(createBalanceUpdater)
    }),
)
run(() =>
    currentMaskWalletAccountSettings.addListener(() => {
        balanceUpdater.build(createBalanceUpdater)
    }),
)
