import { story } from '@dimensiondev/maskbook-storybook-shared'
import { HistoryTableUI as C } from '../../../src/pages/Wallets/components/HistoryTable'
import { action } from '@storybook/addon-actions'
import { ZerionTransactionDirection } from '@dimensiondev/web3-shared'

const { meta, of } = story(C)

export default meta({ title: 'Components/Wallet/History Table' })

export const HistoryTable = of({
    args: {
        page: 1,
        onPageChange: action('onPageChange'),
        hasNextPage: false,
        isLoading: false,
        isEmpty: false,
        dataSource: [
            {
                type: 'transfer',
                id: '0xa82e0e80f3875aaee35127c57e992b248e20415a1cd1b84c6f61cf3a13060c1e',
                timeAt: new Date(),
                toAddress: '0x775e8dafe1b07f3081968a15f3af07a5351fc078',
                failed: false,
                pairs: [
                    {
                        name: 'USD Coin',
                        symbol: 'USDC',
                        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
                        direction: ZerionTransactionDirection.OUT,
                        amount: 4017.562761,
                    },
                ],
                gasFee: {
                    eth: 0.000860625,
                    usd: 1.82241646875,
                },
                transactionType: 'send',
            },
        ],
    },
})
