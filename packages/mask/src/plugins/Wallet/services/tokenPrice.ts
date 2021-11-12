import { CryptoPrice, CurrencyType } from '@masknet/web3-shared-evm'
import { pollingTask } from '@masknet/shared'
import { getTokenPrices, getNativeTokenPrice } from '../../../extension/background-script/EthereumService'
import { startEffects } from '../../../../utils-pure'
import { UPDATE_CHAIN_STATE_DELAY } from '../constants'
import { currentTokenPricesSettings } from '../settings'
import { uniq } from 'lodash-es'

const { run } = startEffects(import.meta.webpackHot)

function updateCurrentPrices(data: CryptoPrice) {
    const currentPrices: CryptoPrice = { ...currentTokenPricesSettings.value }
    Object.keys(data).forEach((category) => {
        Object.keys(data[category]).forEach((currency) => {
            currentPrices[category] = {
                ...currentPrices[category],
                [currency]: data[category][currency],
            }
        })
    })
    currentTokenPricesSettings.value = currentPrices
}

let tokenTrackingCount = 0
let nativeTokenCount = 0

export function kickToUpdateTokenPrices() {
    tokenTrackingCount += 1
    nativeTokenCount += 1
}

const trackingContracts: Record<string, string[]> = Object.create(null)
export function trackContract(platform: string, address: string) {
    trackingContracts[platform] = uniq([...(trackingContracts[platform] ?? []), address.toString()])
}

export async function updateTokenPrices() {
    // reset the polling task cause it will be called from service call
    resetPoolTask()

    // forget those passed beats
    tokenTrackingCount = 0

    // update chain state
    try {
        const platforms = Object.keys(trackingContracts)
        await Promise.allSettled(
            platforms.map(async (platform) => {
                const prices = await getTokenPrices(platform, trackingContracts[platform], CurrencyType.USD)
                updateCurrentPrices(prices)
            }),
        )
    } finally {
        // reset the polling if chain state updated successfully
        resetPoolTask()
    }
}

const trackingNativeTokenIds: string[] = []
export function trackNativeToken(id: string) {
    if (!trackingNativeTokenIds.includes(id)) {
        trackingNativeTokenIds.push(id)
    }
}

export async function updateNativeTokenPrices() {
    // reset the polling task cause it will be called from service call
    resetPoolTask()

    // forget those passed beats
    nativeTokenCount = 0

    // update chain state
    try {
        const prices = await getNativeTokenPrice(trackingNativeTokenIds, CurrencyType.USD)
        updateCurrentPrices(prices)
    } catch {
        // do nothing
    } finally {
        // reset the polling if chain state updated successfully
        resetPoolTask()
    }
}

let resetPoolTask: () => void = () => {}

// poll the newest chain state
run(() => {
    const { reset, cancel } = pollingTask(
        async () => {
            if (tokenTrackingCount > 0) {
                await updateTokenPrices()
            }
            if (nativeTokenCount > 0) {
                await updateNativeTokenPrices()
            }
            return false
        },
        {
            delay: UPDATE_CHAIN_STATE_DELAY,
        },
    )
    resetPoolTask = reset
    return cancel
})
const ETH_PRICE_POLLING_DELAY = 30 /* seconds */ * 1000 /* milliseconds */
run(() => {
    trackNativeToken('ethereum')
    const { cancel } = pollingTask(
        async () => {
            updateNativeTokenPrices()
            return false
        },
        {
            autoStart: true,
            delay: ETH_PRICE_POLLING_DELAY,
        },
    )
    return cancel
})
