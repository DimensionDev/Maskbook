import { story } from '@masknet/storybook-shared'
import { ImportWallet as C } from '../../../src/pages/Wallets/components/ImportWallet'

const { meta, of } = story(C)

export default meta({ title: 'Pages/Wallet/Import Wallet' })

export const ImportWallet = of({})
