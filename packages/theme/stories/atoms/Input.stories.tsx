import { InputBase as MuiInput, TextFieldProps } from '@mui/material'
import { story, MuiArgs, matrix } from '../utils/index.js'

const { meta, of } = story(MuiInput)
export default meta({
    title: 'Atoms/InputBase',
    argTypes: MuiArgs.textField,
    parameters: {
        ...matrix<TextFieldProps>({
            error: [true, false],
        }),
    },
})

export const Input = of({
    args: {
        placeholder: 'Hello World',
        error: false,
    },
})
