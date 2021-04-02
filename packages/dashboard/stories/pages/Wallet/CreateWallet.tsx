import { story } from '@dimensiondev/maskbook-storybook-shared'
import { CreateWallet as C } from '../../../src/pages/Wallets/CreateWallet'
const { meta, of } = story(C)

export default meta({ title: '/Pages/Wallet/Create Wallet' })

export const CreateWallet = of({})
