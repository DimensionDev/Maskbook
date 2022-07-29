import {
    calculateActualOdds,
    configure,
    fetchGames,
    fetchUserBets,
    setContractAddresses,
    setSelectedChainId,
} from '@azuro-protocol/sdk'
import type { ChainId } from '@masknet/web3-shared-evm'
import { configureAzuroSDK } from '../helpers/configureAzuroSDK'

export async function fetchMyBets(account: string, chainId: ChainId) {
    await configureAzuroSDK(chainId)

    const bets = await fetchUserBets({ account })
    return bets
}

export async function fetchEvents(chainId: ChainId) {
    await configureAzuroSDK(chainId)

    const events = await fetchGames({
        filters: {
            resolved: false,
            canceled: false,
        },
        from: 26746224,
        rangeWide: 50000,
    })

    return events
}

interface CalculateOddsProps {
    chainId: ChainId
    conditionId: number
    outcomeId: number
    betAmount: number
}

export async function calculateActualRate({
    chainId,
    conditionId,
    outcomeId,
    betAmount,
}: CalculateOddsProps): Promise<number> {
    configureAzuroSDK(chainId)

    return calculateActualOdds({
        conditionId,
        outcomeId,
        betAmount,
    })
}

export async function testEvents() {
    setSelectedChainId(100)

    setContractAddresses({
        core: '0x4fE6A9e47db94a9b2a4FfeDE8db1602FD1fdd37d',
        lp: '0xac004b512c33D029cf23ABf04513f1f380B3FD0a',
        bet: '0xFd9E5A2A1bfc8B57A288A3e12E2c601b0Cc7e476',
        token: '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d',
    })

    configure({
        rpcUrl: 'https://cors.r2d2.to/?https://xdai-rpc.gateway.pokt.network',
        ipfsGateway: 'https://ipfs-gateway.azuro.org/ipfs/',
    })

    try {
        const games = await fetchGames({
            filters: {
                resolved: false,
                canceled: false,
            },
            from: 26746291,
            // rangeWide: 1000,
        })

        console.log('gamesInterieur: ', games)

        return games
    } catch (err) {
        console.log('err: ', err)

        return err
    }
}
