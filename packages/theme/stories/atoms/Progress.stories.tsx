import type { Meta } from '@storybook/react'
import { LinearProgress as component } from '@mui/material'
export default {
    component,
    title: 'Atoms/Determinate LinearProgress',
    args: {
        variant: 'determinate',
        value: 50,
        sx: {
            width: 200,
        },
    },
} as Meta<typeof component>
