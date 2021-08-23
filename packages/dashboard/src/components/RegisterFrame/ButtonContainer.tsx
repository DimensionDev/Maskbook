import { styled } from '@material-ui/core/styles'
import { buttonClasses, Stack } from '@material-ui/core'
import type { PropsWithChildren } from 'react'

const ButtonContainerUI = styled(Stack)(({ theme }) => ({
    margin: `${theme.spacing(7)} auto`,
    width: '75%',
    [`& > .${buttonClasses.root}`]: {
        width: '100%',
        fontSize: 16,
    },
}))

interface ButtonGroupProps extends PropsWithChildren<{}> {}

export const ButtonContainer = ({ children }: ButtonGroupProps) => {
    return (
        <ButtonContainerUI my={7} direction="row" spacing={2} justifyContent="center">
            {children}
        </ButtonContainerUI>
    )
}
