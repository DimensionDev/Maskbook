import type { Meta } from '@storybook/react'
import { DialogExample as component } from './DialogExample.js'
export default {
    component,
    title: 'Atoms/Dialog',
    args: { withBack: true, withExit: true, withLeftAction: false },
} as Meta<typeof component>
