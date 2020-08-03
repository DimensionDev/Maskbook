import { action } from '@storybook/addon-actions'
import { storiesOf } from '@storybook/react'
import React from 'react'
import MainDialog from '../plugins/FileService/MainDialog'
import { figmaLink } from './utils'

storiesOf('Plugin: File Service', module).add(
    'Main Dialog',
    () => (
        <div style={{ padding: 16, background: '#fff' }}>
            <MainDialog open onConfirm={action('onConfirm')} onDecline={action('onDecline')} />
        </div>
    ),
    figmaLink('https://www.figma.com/file/jcrvENZmip6PUR66Jz6ENb/Plugin%3A-File-Service'),
)
