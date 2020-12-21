import { TextField } from '@material-ui/core'
import { story, MuiArgs } from './utils'

const { meta, of } = story(TextField)
export default meta({
    title: 'TextField',
    argTypes: MuiArgs.textField,
})

export const Default = of({
    args: {
        label: 'Your name',
        placeholder: 'Placeholder',
    },
})
