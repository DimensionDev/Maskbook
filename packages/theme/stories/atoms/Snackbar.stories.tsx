import { MuiArgs, story } from '../utils'
import { Button } from '@mui/material'
import { useCustomSnackbar, ShowSnackbarOptions } from '../../src'

const { meta, of } = story((props: ShowSnackbarOptions) => {
    const { showSnackbar } = useCustomSnackbar()
    return (
        <Button
            onClick={() => {
                showSnackbar(props.title, { variant: props.variant, message: props.message, persist: true })
            }}>
            Click me
        </Button>
    )
})

export default meta({
    title: 'Atoms/Snackbar',
    argTypes: MuiArgs.snackbar,
})

export const Snackbar = of({
    args: {
        variant: 'default',
        title: 'Test',
        message: 'Test Message',
    },
})
