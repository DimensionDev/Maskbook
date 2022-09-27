import type { TextFieldProps } from '@mui/material'
import { story, MuiArgs, matrix } from '../utils/index.js'
import { MaskTextField as TextField } from '../../src/Components/TextField/index.js'

const { meta, of } = story(TextField)
export default meta({
    title: 'Components/MaskTextField',
    argTypes: MuiArgs.textField,
    parameters: {
        ...matrix<TextFieldProps>({
            error: [true, false],
        }),
    },
})

export const MaskTextField = of({
    args: { label: 'Label', helperText: 'Helper message', placeholder: 'Please input message' },
})
