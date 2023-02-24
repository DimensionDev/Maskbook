import type { Meta } from '@storybook/react'
import { Alert as component } from '@mui/material'
import { noop } from 'lodash-es'
import { MuiArgs } from '../utils/index.js'

export default {
    component,
    title: 'Atoms/Alert',
    argTypes: MuiArgs.alert,
    args: {
        severity: 'error',
        children: 'Info message',
        onClose: noop,
    },
} as Meta<typeof component>
