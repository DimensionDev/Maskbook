import React from 'react'

import { storiesOf } from '@storybook/react'
import Welcome0 from '../components/Welcomes/0'
import Welcome1a1 from '../components/Welcomes/1a1'
import Welcome1a2 from '../components/Welcomes/1a2'
import Welcome1a3 from '../components/Welcomes/1a3'
import Welcome1a4 from '../components/Welcomes/1a4'

storiesOf('Welcome', module)
    .add('Step 0', () => <Welcome0 />)
    .add('Step 1a-1', () => <Welcome1a1 />)
    .add('Step 1a-2', () => <Welcome1a2 />)
    .add('Step 1a-3', () => <Welcome1a3 />)
    .add('Step 1a-4', () => <Welcome1a4 />)
