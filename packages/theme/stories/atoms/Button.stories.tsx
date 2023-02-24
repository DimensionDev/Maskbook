import type { Meta } from '@storybook/react'
import { Button as component, ButtonProps } from '@mui/material'
import { MuiArgs, matrix } from '../utils/index.js'

export default {
    component,
    title: 'Atoms/Button',
    argTypes: MuiArgs.button,
    parameters: {
        ...matrix<ButtonProps>({
            variant: ['contained', 'outlined', 'text'],
            color: ['inherit', 'primary', 'secondary', 'error' as any],
        }),
    },
    args: {
        children: 'A button?',
    },
} as Meta<typeof component>
