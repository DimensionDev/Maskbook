import type { Meta } from '@storybook/react'
import { InputBase as component, TextFieldProps } from '@mui/material'
import { MuiArgs, matrix } from '../utils/index.js'

export default {
    component,
    title: 'Atoms/InputBase',
    argTypes: MuiArgs.textField,
    parameters: {
        ...matrix<TextFieldProps>({
            error: [true, false],
        }),
    },
    args: {
        placeholder: 'Hello World',
        error: false,
    },
} as Meta<typeof component>
