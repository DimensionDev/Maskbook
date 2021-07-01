import { story } from '@masknet/storybook-shared'
import { action } from '@storybook/addon-actions'
import { TokenTableUI as C } from '../../../src/pages/Wallets/components/TokenTable'

const { meta, of } = story(C)

export default meta({ title: 'Components/Wallet/Token Table' })

export const TokenTable = of({
    args: {
        page: 1,
        onPageChange: action('onPageChange'),
        isLoading: false,
        isEmpty: true,
        showPagination: true,
        dataSource: [],
        count: 0,
    },
})
