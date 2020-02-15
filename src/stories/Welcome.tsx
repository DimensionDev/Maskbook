import React from 'react'
import { storiesOf } from '@storybook/react'
import { linkTo as to, linkTo } from '@storybook/addon-links'
import { text, boolean, number } from '@storybook/addon-knobs'
import { action } from '@storybook/addon-actions'
import { BannerUI } from '../components/Welcomes/Banner'
import { Dialog } from '@material-ui/core'
import QRScanner from '../components/QRScanner'
import { demoPeople } from './demoPeopleOrGroups'

const ResponsiveDialog = Dialog
storiesOf('Welcome', module)
    .add('Banner', () => {
        const desc = text('description', '')
        const title = text('title', '')
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
                title={title === '' ? undefined : title}
            />
        )
    })
    .add('QRCode Scanner', () => (
        <QRScanner
            scanning={boolean('start scanning?', false)}
            height={number('width', 500)}
            width={number('height', 500)}
            onResult={action('scan')}
            onError={action('error')}
        />
    ))
