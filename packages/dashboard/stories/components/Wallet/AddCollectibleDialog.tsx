import { story } from '@dimensiondev/maskbook-storybook-shared'
import { AddCollectibleDialog as C } from '../../../src/pages/Wallets/components/AddCollectibleDialog'
import { action } from '@storybook/addon-actions'

const { meta, of } = story(C)

export default meta({ title: 'Components/Wallet/Add Collectible Dialog' })

export const AddTokenDialog = of({
    args: {
        open: true,
        onClose: action('onClose'),
    },
})
