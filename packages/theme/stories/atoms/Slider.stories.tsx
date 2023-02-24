import type { Meta } from '@storybook/react'
import { Slider as component } from '@mui/material'

export default {
    component,
    title: 'Atoms/Slider',
    args: {
        defaultValue: 50,
    },
} as Meta<typeof component>
