import { story } from '@masknet/storybook-shared'
import { TokenTableUI as C } from '../../../src/pages/Wallets/components/FungibleTokenTable/index.js'

const { meta, of } = story(C)

export default meta({ title: 'Components/Wallet/Token Table' })

export const TokenTable = of({
    args: {
        isLoading: false,
        isEmpty: true,
        data: [],
    },
})
