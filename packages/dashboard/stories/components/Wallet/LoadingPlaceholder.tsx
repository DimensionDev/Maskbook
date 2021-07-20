import { story } from '@masknet/storybook-shared'
import { LoadingPlaceholder as C } from '../../../src/pages/Wallets/components/LoadingPlacholder'

const { meta, of } = story(C)
export default meta({ title: 'Pages/Wallet/Loading Placeholder' })
export const LoadingPlaceholder = of({})
