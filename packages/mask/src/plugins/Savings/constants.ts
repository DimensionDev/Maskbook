export const SAVINGS_PLUGIN_NAME = 'Savings'
export const SAVINGS_PLUGIN_ID = 'com.savings'

export interface SavingsNetwork {
    chainId: number
    chainName: string
}

export interface SavingsProtocol {
    id: number
    name: string
    image: string
    base: string
    pair: string
    apr: string
    balance: string
    availableNetworks: SavingsNetwork[]
}

export const SavingsProtocols: SavingsProtocol[] = [
    {
        id: 0,
        name: 'Lido',
        image: 'lido',
        base: 'ETH',
        pair: 'stETH',
        apr: '5.3',
        balance: '0.00',
        availableNetworks: [
            { chainId: 1, chainName: 'Ethereum' },
            { chainId: 5, chainName: 'Gorli' },
        ],
    },
]
