import type { SavingsProtocol } from '../../types'
import { lidoDeposit, lidoWithdraw } from './LDOProtocol'

export const SavingsProtocols: SavingsProtocol[] = [
    {
        id: 0,
        name: 'Lido',
        image: 'lido',
        base: 'ETH',
        pair: 'stETH',
        apr: '5.3',
        balance: '0.00',
        deposit: lidoDeposit,
        withdraw: lidoWithdraw,
        availableNetworks: [
            { chainId: 1, chainName: 'Ethereum' },
            { chainId: 5, chainName: 'Gorli' },
        ],
    },
]
