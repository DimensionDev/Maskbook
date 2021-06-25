import { story } from '@masknet/storybook-shared'
import { HistoryTableUI as C } from '../../../src/pages/Wallets/components/HistoryTable'
import { action } from '@storybook/addon-actions'

const { meta, of } = story(C)

export default meta({ title: 'Components/Wallet/History Table' })

export const HistoryTable = of({
    args: {
        page: 1,
        onPageChange: action('onPageChange'),
        hasNextPage: false,
        isLoading: false,
        isEmpty: true,
        dataSource: [],
    },
})
