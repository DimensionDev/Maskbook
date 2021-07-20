import { story } from '@masknet/storybook-shared'
import { CreateWalletForm as C } from '../../../src/components/CreateWalletForm'
import { ETHIcon } from '@masknet/icons'

const { meta, of } = story(C)

export default meta({
    title: 'Components/Wallet/Create Wallet Form',
})

export const CreateWalletForm = of({
    args: {
        options: [{ label: 'ETH', value: 1, icon: <ETHIcon /> }],
    },
})
