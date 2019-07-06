import React from 'react'
import { storiesOf } from '@storybook/react'
import { OptionsPage } from '../components/OptionsPage'
import Identity from '../components/Dashboard/Identity'
import { demoPeople } from './demoPeople'
import { action } from '@storybook/addon-actions'
import Dashboard from '../components/Dashboard/Dashboard'

storiesOf('Options page', module).add('Index', () => <OptionsPage />)
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
