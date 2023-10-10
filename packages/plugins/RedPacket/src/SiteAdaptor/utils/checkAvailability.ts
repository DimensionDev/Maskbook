import type { AbiItem } from 'web3-utils'
import { Web3 } from '@masknet/web3-providers'
import type { RedpacketAvailability } from '@masknet/web3-providers/types'
import { encodeFunctionData, type ChainId, decodeOutputString } from '@masknet/web3-shared-evm'
import REDPACKET_ABI from '@masknet/web3-contracts/abis/HappyRedPacketV4.json'

// red-packet contract readonly method, read it no matter on whatever chains you are.
export async function checkAvailability(pid: string, from: string, to: string, chainId: ChainId) {
    const callData = encodeFunctionData(REDPACKET_ABI as AbiItem[], [pid], 'check_availability')
    const data = await Web3.callTransaction(
        {
            to,
            from,
            data: callData,
        },
        { chainId },
    )
    return decodeResult(data)
}

function decodeResult(data: string): RedpacketAvailability {
    const results = decodeOutputString(REDPACKET_ABI as AbiItem[], data, 'check_availability')
    if (!results) throw new Error('Failed to decode result.')

    return {
        token_address: results.token_address,
        balance: parseHexToInt(results.balance),
        total: +parseHexToInt(results.total),
        claimed: +parseHexToInt(results.claimed),
        expired: !!results.expired,
        claimed_amount: parseHexToInt(results.claimed_amount),
    }
}

function parse(input: any) {
    return JSON.parse(JSON.stringify(input))
}

function parseHexToInt(input: any) {
    return Number.parseInt(parse(input).hex, 16).toString()
}
