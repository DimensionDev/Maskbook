import { storiesOf } from '@storybook/react'
import { figmaLink } from './utils'
import { text } from '@storybook/addon-knobs'
import { QRCodeModel } from '../plugins/Wallet/UI/WalletConnectQRCodeDialog/QRCodeModel'
import { FirefoxPlatform } from '../plugins/Wallet/UI/WalletConnectQRCodeDialog/FirefoxPlatform'
import { SafariPlatform } from '../plugins/Wallet/UI/WalletConnectQRCodeDialog/SafariPlatform'
import { InjectedDialog } from '../components/shared/InjectedDialog'
import { DialogContent } from '@material-ui/core'
import { action } from '@storybook/addon-actions'

storiesOf('Plugin: Wallet (Wallet Connect - QRCode Dialog)', module)
    .add(
        'QRCode Model',
        () => (
            <InjectedDialog open onClose={action('onClose')} title="WalletConnect">
                <DialogContent>
                    <QRCodeModel uri={text('URI', 'Wallet Connect URI')} />
                </DialogContent>
            </InjectedDialog>
        ),
        figmaLink('https://www.figma.com/file/xxHFHHzRgN2E90xCOB83ae/Dashboard?node-id=1144%3A6747'),
    )
    .add(
        'Firefox only (Android specific)',
        () => (
            <InjectedDialog open onClose={action('onClose')} title="WalletConnect">
                <DialogContent>
                    <FirefoxPlatform uri={text('URI', 'Wallet Connect URI')} />
                </DialogContent>
            </InjectedDialog>
        ),
        figmaLink('https://www.figma.com/file/xxHFHHzRgN2E90xCOB83ae/Dashboard?node-id=806%3A23705'),
    )
    .add('Safari only (iOS specific)', () => (
        <InjectedDialog open onClose={action('onClose')} title="WalletConnect">
            <DialogContent>
                <SafariPlatform uri={text('URI', 'Wallet Connect URI')} />
            </DialogContent>
        </InjectedDialog>
    ))
