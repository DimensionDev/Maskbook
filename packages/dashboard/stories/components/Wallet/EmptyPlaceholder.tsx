import { story } from '@dimensiondev/maskbook-storybook-shared'
import { EmptyPlaceholder as C } from '../../../src/pages/Wallets/components/EmptyPlaceholder'

const { meta, of } = story(C)

export default meta({ title: 'Pages/Wallet/Empty Placeholder' })

export const EmptyPlaceholder = of({
    args: {
        prompt: 'Empty Placeholder',
    },
})
