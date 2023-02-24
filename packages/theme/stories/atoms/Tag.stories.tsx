import type { Meta } from '@storybook/react'
import { Tag as component } from '../../src/Components/index.js'
export default {
    component,
    title: 'Atoms/Tags',
    args: {
        children: 'Info Tag',
    },
} as Meta<typeof component>
