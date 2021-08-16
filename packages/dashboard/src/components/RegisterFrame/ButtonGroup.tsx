import { experimentalStyled as styled } from '@material-ui/core/styles'
import { buttonClasses, Stack } from '@material-ui/core'
import type { PropsWithChildren } from 'react'

const ButtonGroupUI = styled(Stack)(({ theme }) => ({
    [`& > .${buttonClasses.root}`]: {
        width: 225,
        fontSize: 16,
    },
}))

interface ButtonGroupProps extends PropsWithChildren<{}> {}

export const ButtonGroup = ({ children }: ButtonGroupProps) => {
    return (
        <ButtonGroupUI my={7} direction="row" spacing={2} justifyContent="center">
            {children}
        </ButtonGroupUI>
    )
}
