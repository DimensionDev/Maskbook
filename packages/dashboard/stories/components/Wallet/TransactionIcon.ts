import { story } from '@masknet/storybook-shared'
import { TransactionIconUI as C } from '../../../src/pages/Wallets/components/TransactionIcon'

const { meta, of } = story(C)

export default meta({ title: 'Components/Wallet/Transaction Icon' })
export const TransactionIcon = of({
    args: {
        isRedPacket: false,
        isFailed: false,
        type: 'Sent',
        transactionType: 'sent',
    },
})
