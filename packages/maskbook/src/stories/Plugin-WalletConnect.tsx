import { storiesOf } from '@storybook/react'
import { figmaLink } from './utils'
import { WalletConnectQRCodeDialog } from '../plugins/Wallet/UI/WalletConnectQRCodeDialog'

storiesOf('Plugin: Wallet Connect (Dialog)', module)
    .add(
        'QRCode Model',
        () => <WalletConnectQRCodeDialog mode="qrcode" />,
        figmaLink('https://www.figma.com/file/xxHFHHzRgN2E90xCOB83ae/Dashboard?node-id=1144%3A6747'),
    )
    .add(
        'Firefox only (Android specific)',
        () => <WalletConnectQRCodeDialog mode="firefox" />,
        figmaLink('https://www.figma.com/file/xxHFHHzRgN2E90xCOB83ae/Dashboard?node-id=806%3A23705'),
    )
    .add('Safari only (iOS specific)', () => <WalletConnectQRCodeDialog mode="safari" />)
