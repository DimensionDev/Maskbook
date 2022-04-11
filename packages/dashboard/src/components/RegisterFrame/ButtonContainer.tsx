import { styled } from '@mui/material/styles'
import { buttonClasses, Stack } from '@mui/material'
import type { PropsWithChildren } from 'react'

const ButtonContainerUI = styled(Stack)(({ theme }) => ({
    margin: `${theme.spacing(3.75)} auto`,
    width: '75%',
    [`& > .${buttonClasses.root}`]: {
        width: '100%',
        fontSize: 16,
    },
    [theme.breakpoints.down('md')]: {
        margin: `${theme.spacing(4)} auto`,
    },
}))

interface ButtonGroupProps extends PropsWithChildren<{}> {}

export const ButtonContainer = ({ children }: ButtonGroupProps) => (
    <ButtonContainerUI my={7} direction="row" spacing={2} justifyContent="center" alignItems="center">
        {children}
    </ButtonContainerUI>
)
