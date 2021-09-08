import type { TextFieldProps } from '@material-ui/core'
import { story, MuiArgs, matrix } from '../utils'
import { MaskTextField as TextField } from '../../src/Components/TextField'

const { meta, of } = story(TextField)
export default meta({
    title: 'Atoms/MaskTextField',
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
