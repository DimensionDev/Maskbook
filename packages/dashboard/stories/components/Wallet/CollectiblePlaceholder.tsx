import { story } from '@masknet/storybook-shared'

import { CollectiblePlaceholder as C } from '../../../src/pages/Wallets/components/CollectiblePlaceHolder'

const { meta, of } = story(C)

export default meta({ title: 'Pages/Wallet/Collectible Placeholder' })
export const CollectiblePlaceholder = of({
    args: {},
})
