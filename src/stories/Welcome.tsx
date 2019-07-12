import React from 'react'
import { storiesOf } from '@storybook/react'
import Welcome0 from '../components/Welcomes/0'
import Welcome1a2 from '../components/Welcomes/1a2'
import Welcome1a3 from '../components/Welcomes/1a3'
import Welcome1a4v2 from '../components/Welcomes/1a4.v2'
import Welcome1b1 from '../components/Welcomes/1b1'
import Welcome2 from '../components/Welcomes/2'
import { linkTo as to, linkTo } from '@storybook/addon-links'
import { text, boolean } from '@storybook/addon-knobs'
import { action } from '@storybook/addon-actions'
import { Banner } from '../components/Welcomes/Banner'
storiesOf('Welcome', module)
    .add('Banner', () => (
        <Banner disabled={boolean('disabled', false)} close={action('Close')} getStarted={to('Welcome', 'Step 0')} />
    ))
    .add('Step 0', () => (
        <Welcome0 close={action('Close')} create={to('Welcome', 'Step 1a-2')} restore={to('Welcome', 'Step 1b-1')} />
    ))
    .add('Step 1a-2', () => <Welcome1a2 next={to('Welcome', 'Step 1a-3')} />)
    .add('Step 1a-3', () => <Welcome1a3 next={to('Welcome', 'New Step 1a-4')} />)
    .add('New Step 1a-4', () => (
        <Welcome1a4v2
            provePost={text('Prove', '🔒ApfdMwLoV/URKn7grgcNWdMR2iWMGdHpQBk5LVGFxhul🔒')}
            requestAutoVerify={action('Auto')}
            requestManualVerify={action('Manual')}
        />
    ))
    .add('Step 1b-1', () => <Welcome1b1 back={linkTo('Welcome', 'Step 0')} restore={action('Restore with')} />)
    .add('Step 2', () => <Welcome2 />)
