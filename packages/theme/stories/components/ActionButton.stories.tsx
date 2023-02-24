import type { Meta } from '@storybook/react'
import { ActionButton as component } from '../../src/index.js'

export default {
    component,
    title: 'Components/ActionButton',
    argTypes: {
        loading: { type: 'boolean' },
    },
    name: 'Action Button',
    args: {
        children: 'Action Button',
        loading: true,
    },
} as Meta<typeof component>
