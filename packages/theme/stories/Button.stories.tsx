import { Button, ButtonProps } from '@material-ui/core'
import { story, MuiArgs, matrix } from './utils'

const { meta, of } = story(Button)
export default meta({
    title: 'Button',
    argTypes: MuiArgs.button,
    parameters: {
        ...matrix<ButtonProps>({
            variant: ['contained', 'outlined', 'text'],
            color: ['inherit', 'primary', 'secondary', 'error' as any],
        }),
    },
})

export const ButtonExample = of({
    args: {
        children: 'A button?',
    },
})
