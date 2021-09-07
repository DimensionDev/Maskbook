export interface PoolState {
    [chainId: number]: {
        [poolId: string]: {
            shortValue: string | undefined // ethers BigNumber => string
            longValue: string | undefined // ethers BigNumber => string
            sponsorValue: string | undefined // ethers BigNumber => string
            // shortAPY: string // (short+long+ sponsor)/short bigNumberjs bignumber => string
            initialPrice: string | undefined // coundDownValue in entropy-app
            locked: boolean
            gameDuration: number
            bidDuration: number
            lastUpdateTimestamp: number
        }
    }
}
export const initialState: PoolState = {
    42: {
        'BTC-USDT': {
            shortValue: '0', // ethers BigNumber => string
            longValue: '0', // ethers BigNumber => string
            sponsorValue: '0', // ethers BigNumber => string
            // shortAPY: "50", // (short+long+ sponsor)/short bigNumberjs bignumber => string
            initialPrice: '0', // coundDownValue in entropy-app
            locked: false,
            bidDuration: 172800,
            gameDuration: 432000,
            lastUpdateTimestamp: 0,
        },
        'BTC-USDC': {
            shortValue: '0', // ethers BigNumber => string
            longValue: '0', // ethers BigNumber => string
            sponsorValue: '0', // ethers BigNumber => string
            // shortAPY: "50", // (short+long+ sponsor)/short bigNumberjs bignumber => string
            initialPrice: '0', // coundDownValue in entropy-app
            locked: false,
            bidDuration: 172800,
            gameDuration: 432000,
            lastUpdateTimestamp: 0,
        },
        'BTC-DAI': {
            shortValue: '0', // ethers BigNumber => string
            longValue: '0', // ethers BigNumber => string
            sponsorValue: '0', // ethers BigNumber => string
            // shortAPY: "50", // (short+long+ sponsor)/short bigNumberjs bignumber => string
            initialPrice: '0', // coundDownValue in entropy-app
            locked: false,
            bidDuration: 172800,
            gameDuration: 432000,
            lastUpdateTimestamp: 0,
        },
        'ETH-GAS-USDT': {
            shortValue: '0', // ethers BigNumber => string
            longValue: '0', // ethers BigNumber => string
            sponsorValue: '0', // ethers BigNumber => string
            // shortAPY: "50", // (short+long+ sponsor)/short bigNumberjs bignumber => string
            initialPrice: '0', // coundDownValue in entropy-app
            locked: false,
            bidDuration: 172800,
            gameDuration: 432000,
            lastUpdateTimestamp: 0,
        },
    },
}
