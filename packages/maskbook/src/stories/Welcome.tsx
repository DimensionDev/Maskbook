import { storiesOf } from '@storybook/react'
import { linkTo as to } from '@storybook/addon-links'
import { text, boolean, number } from '@storybook/addon-knobs'
import { action } from '@storybook/addon-actions'
import { BannerUI } from '../components/Welcomes/Banner'
import { Dialog } from '@material-ui/core'
import QRScanner from '../components/QRScanner'
const ResponsiveDialog = Dialog
storiesOf('Welcome', module)
    .add('Banner', () => {
        const desc = text('description', '')
        const isValid = boolean('is username valid', true)
        return (
            <BannerUI
                nextStep={{ onClick: to('Welcome', 'Step 0') }}
                username={{
                    defaultValue: text('default value', ''),
                    value: text('current value', ''),
                    isValid: () => isValid,
                    onChange: action('on username change'),
                }}
                description={desc === '' ? undefined : desc}
            />
        )
    })
    .add('QRCode Scanner', () => (
        <QRScanner
            scanning={boolean('start scanning?', false)}
            height={number('width', 500)}
            width={number('height', 500)}
            onScan={action('scan')}
            onError={action('error')}
        />
    ))
