import { action } from '@storybook/addon-actions'
import { storiesOf } from '@storybook/react'
import React from 'react'
import MainDialog from '../plugins/FileService/MainDialog'
import { figmaLink } from './utils'
import { Preview } from '../plugins/FileService/Preview'
import { text, boolean, number } from '@storybook/addon-knobs'

storiesOf('Plugin: File Service', module)
    .add(
        'Main Dialog',
        () => <MainDialog open onConfirm={action('onConfirm')} onDecline={action('onDecline')} />,
        figmaLink('https://www.figma.com/file/jcrvENZmip6PUR66Jz6ENb/Plugin%3A-File-Service'),
    )
    .add('Preview', () => {
        const decrypted = boolean('Decrypted', true)
        const key = text('Key', 'Decrypted key')
        return (
            <Preview
                info={{
                    createdAt: new Date(),
                    id: text('id', 'id'),
                    key: decrypted ? key : void 0,
                    landingTxID: text('Transaction ID', 'Transaction ID'),
                    name: text('File name', 'file.png'),
                    payloadTxID: text('Payload TxID', 'Payload TxID'),
                    size: number('File Size', 2333),
                    type: 'arweave',
                }}
            />
        )
    })
