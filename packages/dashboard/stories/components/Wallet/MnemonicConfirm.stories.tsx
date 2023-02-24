import type { Meta } from '@storybook/react'
import { actions } from '@storybook/addon-actions'
import { DesktopMnemonicConfirm as component } from '../../../src/components/Mnemonic/DesktopMnemonicConfirm.js'

export default {
    component,
    title: 'Components/Wallet/Mnemonic Confirm',
    argTypes: actions('onChange'),
    args: {
        puzzleWords: [
            'bright',
            'darkness',
            'emo',
            'nature',
            'ocean',
            'pink',
            'primary',
            'purple',
            'sage',
            'sky',
            'sunshine',
            'white',
        ],
    },
} as Meta<typeof component>
