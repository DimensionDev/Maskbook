import { story } from '@masknet/storybook-shared'
import { WalletConnect as C } from '../../../src/components/WalletConnect/index.js'
const { meta, of } = story(C)

export default meta({ title: 'Pages/Wallet/Wallet Connect' })

export const WalletConnect = of({})
