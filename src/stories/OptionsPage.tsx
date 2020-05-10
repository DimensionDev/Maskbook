import React from 'react'
import { storiesOf } from '@storybook/react'
import { QrCode } from '../components/shared/qrcode'
import { text, array } from '@storybook/addon-knobs'
import { RequestPermission } from '../components/RequestPermission/RequestPermission'
import { action } from '@storybook/addon-actions'

storiesOf('Options Page', module)
    .add('QrCode', () => <QrCode text={text('QrCode', 'QrCode')} />)
    .add('Request permission', () => (
        <RequestPermission
            permission={{ origins: array('Requesting', ['https://example.com', 'https://www.example.com'], '\n') }}
            onCancel={action('onCancel')}
            onRequestApprove={action('onRequestApprove')}
        />
    ))
