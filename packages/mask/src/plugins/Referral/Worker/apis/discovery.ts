import type { Discovery } from '../../types'

export async function getDiscovery(): Promise<{
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
