import React from 'react'

import { storiesOf } from '@storybook/react'
import Welcome0 from '../components/Welcomes/0'
import Welcome1a1 from '../components/Welcomes/1a1'

storiesOf('Welcome', module)
    .add('Step 0', () => <Welcome0 />)
    .add('Step 1a-1', () => <Welcome1a1 />)
