import { story } from '@dimensiondev/maskbook-storybook-shared'
import { WalletQRCodeContainer as C } from '../src/components/WalletQRCodeContainer'

const { meta, of } = story(C)

export default meta({ title: 'Components/Wallet QR Code Container' })
export const WalletQRCodeContainer = of({
    args: {
        width: 330,
        height: 330,
        borderHeight: 2,
        borderWidth: 15,
    },
})
