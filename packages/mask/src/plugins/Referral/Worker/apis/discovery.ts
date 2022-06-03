import type { Discovery, DiscoveryFarmOracles } from '../../types'
import { supportedChainId } from '../../constants'

export async function getFullDiscovery(): Promise<{
    discovery: Discovery
    pop: string
}> {
    const response = await fetch('https://discovery.attrace.com/mainnet/full.json')

    const discovery = await response.json()
    const pop = response.headers.get('x-amz-cf-pop') || ''
    return {
        discovery,
        pop,
    }
}

export async function getFarmOraclesDiscovery(): Promise<{
    discovery: DiscoveryFarmOracles
    pop: string
}> {
    try {
        const response = await fetch('https://discovery.attrace.com/mainnet/farmOracles.json')

        const discovery = await response.json()
        const pop = response.headers.get('x-amz-cf-pop') || ''
        return {
            discovery: discovery.farmOracles,
            pop,
        }
    } catch (error) {
        throw new Error(error as any)
    }
}

export async function getReferralFarmsV1Address(): Promise<string> {
    try {
        const res = await getFarmOraclesDiscovery()

        return res.discovery.referralFarmsV1.find((e) => e.chainId === supportedChainId)?.address ?? ''
    } catch (error: unknown) {
        if (error instanceof Error) throw error
        else if (typeof error === 'string') throw new Error(error)
        // ...
    }
}
