import REDPACKET_ABI from '@masknet/web3-contracts/abis/HappyRedPacketV4.json'
import { first } from 'lodash-es'
import { ChainId, getRPCConstants } from '@masknet/web3-shared'
import { Interface } from '@ethersproject/abi'
import { JsonRpcProvider } from '@ethersproject/providers'
import type { RedpacketAvailability } from '../../types'

const interFace = new Interface(REDPACKET_ABI)

// ITO Contract readonly method, read it no matter on whatever chains you are.
export async function checkAvailability(pid: string, from: string, to: string, chainId: ChainId) {
    const { RPC } = getRPCConstants(chainId)
    const providerURL = first(RPC)
    if (!providerURL) throw new Error('Unknown chain id.')
    const provider = new JsonRpcProvider(providerURL)

    const callData = interFace.encodeFunctionData('check_availability', [pid])
    const data = await provider.call({
        to,
        from,
        data: callData,
    })
    return decodeResult(data)
}

function decodeResult(data: string): RedpacketAvailability {
    const results = interFace.decodeFunctionResult('check_availability', data)

    return {
        token_address: results[0],
        balance: parseHexToInt(results[1]),
        total: +parseHexToInt(results[2]),
        claimed: +parseHexToInt(results[3]),
        expired: Boolean(results[4]),
        claimed_amount: parseHexToInt(results[5]),
    }
}

function parse(input: any) {
    return JSON.parse(JSON.stringify(input))
}

function parseHexToInt(input: any) {
    return Number.parseInt(parse(input).hex, 16).toString()
}
