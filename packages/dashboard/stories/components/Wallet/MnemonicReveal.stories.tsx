import type { Meta } from '@storybook/react'
import { MnemonicReveal as component } from '../../../src/components/Mnemonic/index.js'

export default {
    component,
    title: 'Components/Wallet/Mnemonic Reveal',
    args: {
        words: [...Array(12).keys()].map((i) => String('word' + i)),
    },
} as Meta<typeof component>
