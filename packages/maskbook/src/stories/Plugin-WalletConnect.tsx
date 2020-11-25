import { storiesOf } from '@storybook/react'
import { figmaLink } from './utils'
import { QRCodeDialog } from '../plugins/Wallet/UI/WalletConnectQRCodeDialog'
import { action } from '@storybook/addon-actions'
import { text } from '@storybook/addon-knobs'

storiesOf('Plugin: Wallet Connect (Dialog)', module)
    .add(
        'QRCode Model',
        () => <QRCodeDialog open uri={text('Wallet Connect URI', 'wc://')} onClose={action('onClose')} mode="qrcode" />,
        figmaLink('https://www.figma.com/file/xxHFHHzRgN2E90xCOB83ae/Dashboard?node-id=1144%3A6747'),
    )
    .add(
        'Firefox only (Android specific)',
        () => (
            <QRCodeDialog open uri={text('Wallet Connect URI', 'wc://')} onClose={action('onClose')} mode="firefox" />
        ),
        figmaLink('https://www.figma.com/file/xxHFHHzRgN2E90xCOB83ae/Dashboard?node-id=806%3A23705'),
    )
    .add('Safari only (iOS specific)', () => (
        <QRCodeDialog open uri={text('Wallet Connect URI', 'wc://')} onClose={action('onClose')} mode="safari" />
    ))
