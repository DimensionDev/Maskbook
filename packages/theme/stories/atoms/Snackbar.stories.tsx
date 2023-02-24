import type { Meta } from '@storybook/react'
import { MuiArgs } from '../utils/index.js'
import { Button } from '@mui/material'
import { useCustomSnackbar, ShowSnackbarOptions } from '../../src/index.js'

function Component(props: ShowSnackbarOptions) {
    const { showSnackbar } = useCustomSnackbar()
    return (
        <Button
            onClick={() => {
                showSnackbar(props.title, { variant: props.variant, message: props.message, persist: true })
            }}>
            Click me
        </Button>
    )
}

export default {
    component: Component,
    title: 'Atoms/Snackbar',
    argTypes: MuiArgs.snackbar,
    args: {
        variant: 'default',
        title: 'Test',
        message: 'Test Message',
    },
} as Meta<typeof Component>
