import { CryptoPrice, CurrencyType } from '@masknet/web3-shared-evm'
import { pollingTask } from '@masknet/shared-base'
import { startEffects } from '../../../../utils-pure'
import { UPDATE_CHAIN_STATE_DELAY } from '../constants'
import { currentTokenPricesSettings } from '../settings'
import { noop } from 'lodash-unified'
import { TokenPrice } from '@masknet/web3-providers'

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
let nativeTokenTrackingCount = 0

export function decreaseTokenTracking() {
    if (tokenTrackingCount > 0) {
        tokenTrackingCount -= 1
    }
}

export function decreaseNativeTokenTracking() {
    if (nativeTokenTrackingCount > 0) {
        nativeTokenTrackingCount -= 1
    }
}

const trackingContracts: Record<string, string[]> = Object.create(null)
export function trackContract(platform: string, address: string) {
    tokenTrackingCount += 1
    const addresses = trackingContracts[platform] ?? []
    if (addresses.includes(address)) return

    trackingContracts[platform] = [...addresses, address]
    resetPoolTask(true)
}

async function updateTokenPrices() {
    try {
        const platforms = Object.keys(trackingContracts)
        await Promise.allSettled(
            platforms.map(async (platform) => {
                const prices = await TokenPrice.getTokenPrices(platform, trackingContracts[platform], CurrencyType.USD)
                updateCurrentPrices(prices)
            }),
        )
    } catch {}
}

const trackingNativeTokenIds: string[] = ['ethereum']
export function trackNativeToken(id: string) {
    nativeTokenTrackingCount += 1
    if (trackingNativeTokenIds.includes(id)) return

    trackingNativeTokenIds.push(id)
    resetPoolTask(true)
}

async function updateNativeTokenPrices() {
    try {
        const prices = await TokenPrice.getNativeTokenPrice(trackingNativeTokenIds, CurrencyType.USD)
        updateCurrentPrices(prices)
    } catch {}
}

let resetPoolTask = noop
run(() => {
    const { reset, cancel } = pollingTask(
        async () => {
            if (tokenTrackingCount > 0) {
                await updateTokenPrices()
            }
            if (nativeTokenTrackingCount > 0) {
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
