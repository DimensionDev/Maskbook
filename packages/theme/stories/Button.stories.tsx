import { Button } from '@material-ui/core'
import { story, MuiArgs } from './utils'

const { meta, of } = story(Button)
export default meta({
    title: 'Button',
    argTypes: MuiArgs.button,
})

export const ButtonExample = of({
    args: {
        children: 'A button?',
        variant: 'contained',
        size: 'medium',
    },
})
