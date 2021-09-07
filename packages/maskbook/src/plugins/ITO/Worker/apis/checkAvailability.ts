import ITO_ABI from '@masknet/web3-contracts/abis/ITO.json'
import ITO2_ABI from '@masknet/web3-contracts/abis/ITO2.json'
import { first } from 'lodash-es'
import { ChainId, getRPCConstants } from '@masknet/web3-shared'
import { Interface } from '@ethersproject/abi'
import { JsonRpcProvider } from '@ethersproject/providers'
import type { Availability } from '../../types'

const interFaceV1 = new Interface(ITO_ABI)
const interFaceV2 = new Interface(ITO2_ABI)

// ITO Contract readonly method, read it no matter on whatever chains you are.
export async function checkAvailability(pid: string, from: string, to: string, chainId: ChainId, isV1 = false) {
    const { RPC } = getRPCConstants(chainId)
    const providerURL = first(RPC)
    if (!providerURL) throw new Error('Unknown chain id.')
    const provider = new JsonRpcProvider(providerURL)

    const callData = (isV1 ? interFaceV1 : interFaceV2).encodeFunctionData('check_availability', [pid])
    const data = await provider.call({
        to,
        from,
        data: callData,
    })
    return decodeResult(data, isV1)
}

function decodeResult(data: string, isV1: boolean): Availability {
    const results = (isV1 ? interFaceV1 : interFaceV2).decodeFunctionResult('check_availability', data)

    return {
        exchange_addrs: results[0],
        remaining: +parseHexToInt(results[1]),
        started: results[2],
        expired: results[3],
        unlocked: results[4],
        unlock_time: parseHexToInt(results[5]),
        swapped: parseHexToInt(results[6]),
        exchanged_tokens: parse(results[7]).map(parseHexToInt),
        ...(isV1
            ? {}
            : {
                  claimed: results[8],
                  start_time: parseHexToInt(results[9]),
                  end_time: parseHexToInt(results[10]),
                  qualification_addr: results[11],
              }),
    }
}

function parse(input: any) {
    return JSON.parse(JSON.stringify(input))
}

function parseHexToInt(input: any) {
    return Number.parseInt(parse(input).hex, 16).toString()
}
