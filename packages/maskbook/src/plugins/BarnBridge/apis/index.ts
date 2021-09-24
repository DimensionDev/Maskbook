import {
    BB_SY_CREAM,
    BB_SY_AAVE,
    BB_SY_COMPOUND,
    APP_URL,
    SY_URL_FRAGMENT,
    API_URL,
    POLYGON_API_URL,
} from '../constants'
import urlcat from 'urlcat'
import { last } from 'lodash-es'
import { ChainId } from '@masknet/web3-shared'

export interface SYPortfolioModelData {
    seniorValue: number
    juniorValue: number
}

export interface SYPoolProps {
    protocolName: string
    coins: SYCoinProps[]
}
export interface SYCoinProps {
    coinName: string
    seniorLiquidity: string
    seniorAPY: number
    juniorLiquidity: string
    juniorAPY: number
    redirectUrl: string
}

export type SYPoolModelData = { [id: string]: SYCoinProps[] }

function ChainIdToBaseUrl(chainId: ChainId) {
    switch (chainId) {
        case ChainId.Mainnet:
            return API_URL
        case ChainId.Matic:
            return POLYGON_API_URL
        default:
            return API_URL
    }
}

export async function SYGetPools(chainId: ChainId) {
    const response = await fetch(urlcat(ChainIdToBaseUrl(chainId), '/smartyield/pools', { originator: 'all' }), {
        body: null,
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
    })
    const protocolsMap: SYPoolModelData = {}

    interface Payload<T> {
        data: T
    }
    interface Entry {
        protocolId: string
        underlyingSymbol: string
        state: State
    }
    interface State {
        seniorApy: number
        juniorApy: number
        seniorLiquidity: string
        juniorLiquidity: string
    }

    const payload: Payload<Entry[]> = await response.json()
    payload.data.map((entry) => {
        const protocolId = PrettifyProtocolName(entry.protocolId)
        if (!(protocolId in protocolsMap)) {
            protocolsMap[protocolId] = []
        }
        const seniorAPY = Number.parseFloat((entry.state.seniorApy * 100).toFixed(2))
        const juniorAPY = Number.parseFloat((entry.state.juniorApy * 100).toFixed(2))
        protocolsMap[protocolId] = protocolsMap[protocolId].concat([
            {
                coinName: entry.underlyingSymbol,
                seniorLiquidity: PrettifyLiquidity(entry.state.seniorLiquidity),
                seniorAPY: seniorAPY,
                juniorLiquidity: PrettifyLiquidity(entry.state.juniorLiquidity),
                juniorAPY: juniorAPY,
                redirectUrl: ConstructRedirectUrl(entry.protocolId, entry.underlyingSymbol),
            },
        ])
    })

    return protocolsMap
}

function PrettifyProtocolName(name: string) {
    if (name === 'aave/v2') {
        return BB_SY_AAVE
    } else if (name === 'compound/v2') {
        return BB_SY_COMPOUND
    } else if (name === 'cream/v2') {
        return BB_SY_CREAM
    }
    return name
}

function ConstructRedirectUrl(protocolName: string, coin: string) {
    return urlcat(APP_URL, `${SY_URL_FRAGMENT}stats`, { m: protocolName, t: coin })
}

function PrettifyLiquidity(liquidity: string) {
    const intLiquidity = Number.parseInt(liquidity, 10)
    if (intLiquidity >= 1000000) {
        return Math.round(intLiquidity / 1000000).toString() + 'M'
    }
    if (intLiquidity >= 1000) {
        return Math.round(intLiquidity / 1000).toString() + 'K'
    }
    return Math.round(intLiquidity).toString()
}

export async function SYGetPortfolio(chainId: ChainId, walletAddress: string) {
    const response = await fetch(
        urlcat(ChainIdToBaseUrl(chainId), '/smartyield/users/:walletAddress/portfolio-value', { walletAddress }),
        {
            body: null,
            method: 'GET',
            mode: 'cors',
            credentials: 'omit',
        },
    )

    interface Payload<T> {
        data: T
    }

    const payload = (await response.json()) as Payload<SYPortfolioModelData[]>

    return last(payload.data) ?? { seniorValue: 5, juniorValue: 5 }
}
