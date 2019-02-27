import React from 'react'

import { storiesOf } from '@storybook/react'
import Welcome0 from '../components/Welcomes/0'
import Welcome1a1 from '../components/Welcomes/1a1'
import Welcome1a2 from '../components/Welcomes/1a2'
import Welcome1a3 from '../components/Welcomes/1a3'
import Welcome1a4 from '../components/Welcomes/1a4'
import Welcome1b1 from '../components/Welcomes/1b1'
import { linkTo as to, linkTo } from '@storybook/addon-links'
import { text } from '@storybook/addon-knobs'
import { action } from '@storybook/addon-actions'

storiesOf('Welcome', module)
    .add('Step 0', () => <Welcome0 create={to('Welcome', 'Step 1a-1')} restore={to('Welcome', 'Step 1b-1')} />)
    .add('Step 1a-1', () => <Welcome1a1 next={to('Welcome', 'Step 1a-2')} />)
    .add('Step 1a-2', () => <Welcome1a2 next={to('Welcome', 'Step 1a-3')} />)
    .add('Step 1a-3', () => (
        <Welcome1a3
            next={to('Welcome', 'Step 1a-4')}
            jsonFileName={text('File', 'maskbook-keystore-backup-20190227.json')}
        />
    ))
    .add('Step 1a-4', () => (
        <Welcome1a4 post={action('Post click')} link={text('URL', 'https://maskbook.app/s/#mQINBF-BxAcBEA-zyfSodx')} />
    ))
    .add('Step 1b-1', () => <Welcome1b1 back={linkTo('Welcome', 'Step 0')} restore={action('Restore with')} />)
