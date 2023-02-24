import type { Meta } from '@storybook/react'
import { HistoryTableUI as component } from '../../../src/pages/Wallets/components/HistoryTable/index.js'
import { action } from '@storybook/addon-actions'

export default {
    component,
    title: 'Components/Wallet/History Table',
    args: {
        page: 1,
        onPageChange: action('onPageChange'),
        hasNextPage: false,
        isLoading: false,
        isEmpty: true,
        dataSource: [],
    },
} as Meta<typeof component>
