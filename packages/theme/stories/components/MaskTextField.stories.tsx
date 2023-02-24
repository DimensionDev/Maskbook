import type { Meta } from '@storybook/react'
import type { TextFieldProps } from '@mui/material'
import { MuiArgs, matrix } from '../utils/index.js'
import { MaskTextField as component } from '../../src/Components/TextField/index.js'

export default {
    component,
    title: 'Components/MaskTextField',
    argTypes: MuiArgs.textField,
    parameters: {
        ...matrix<TextFieldProps>({
            error: [true, false],
        }),
    },
    args: { label: 'Label', helperText: 'Helper message', placeholder: 'Please input message' },
} as Meta<typeof component>
