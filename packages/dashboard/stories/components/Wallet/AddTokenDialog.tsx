import { story } from '@dimensiondev/maskbook-storybook-shared'
import { AddTokenDialog as C } from '../../../src/pages/Wallets/components/AddTokenDialog'
import { action } from '@storybook/addon-actions'

const { meta, of } = story(C)

export default meta({ title: 'Components/Wallet/Add Token Dialog' })

export const AddTokenDialog = of({
    args: {
        open: true,
        onClose: action('onClose'),
    },
})
