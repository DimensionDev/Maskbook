import { story } from '@masknet/storybook-shared'
import { ConnectWalletList as C } from '../../../src/components/ConnectWalletDialog'
import { action } from '@storybook/addon-actions'
const { meta, of } = story(C)

export default meta({ title: 'Pages/Wallet/Connect Wallet' })

export const ConnectWallet = of({
    args: { onConnect: action('onConnect') },
})
