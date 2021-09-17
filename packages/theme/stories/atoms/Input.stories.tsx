import { TextField as MuiInput, TextFieldProps } from '@mui/material'
import { story, MuiArgs, matrix } from '../utils'

const { meta, of } = story(MuiInput)
export default meta({
    title: 'Atoms/Input',
    argTypes: MuiArgs.textField,
    parameters: {
        ...matrix<TextFieldProps>({
            variant: ['outlined', 'filled', 'standard'] as any,
            error: [true, false],
        }),
    },
})

export const Input = of({
    args: { label: 'Label', helperText: 'Helper message' },
})
