import React from 'react'
import { storiesOf } from '@storybook/react'
import { QrCode } from '../components/shared/qrcode'
import { text } from '@storybook/addon-knobs'

storiesOf('Options Page', module).add('QrCode', () => <QrCode text={text('QrCode', 'QrCode')} />)
