import { Button as MuiButton, ButtonProps } from '@material-ui/core'
import { story, MuiArgs, matrix } from '../utils'

const { meta, of } = story(MuiButton)
export default meta({
    title: 'Atoms/Button',
    argTypes: MuiArgs.button,
    parameters: {
        ...matrix<ButtonProps>({
            variant: ['contained', 'outlined', 'text'],
            color: ['inherit', 'primary', 'secondary', 'error' as any],
        }),
    },
})

export const Button = of({
    args: {
        children: 'A button?',
    },
})
