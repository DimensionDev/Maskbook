import React from 'react'
import { storiesOf } from '@storybook/react'
import Identity from '../components/Dashboard/Identity'
import { demoPeople } from './demoPeopleOrGroups'
import { action } from '@storybook/addon-actions'
import Dashboard from '../components/Dashboard/Dashboard'
import { QrCode } from '../components/shared/qrcode'
import { text } from '@storybook/addon-knobs'

storiesOf('Options Page', module).add('QrCode', () => <QrCode text={text('QrCode', 'QrCode')} />)

storiesOf('Dashboard (unused)', module)
    .add('Identity Component (unused)', () => <Identity person={demoPeople[0]} onClick={action('Click')} />)
    .add('Dashboard (unused)', () => (
        <Dashboard
            addAccount={action('Add account')}
            exportBackup={action('Export backup')}
            onProfileClick={action('Click on profile')}
            identities={demoPeople}
        />
    ))
