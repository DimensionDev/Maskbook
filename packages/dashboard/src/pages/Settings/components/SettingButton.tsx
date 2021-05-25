import { Button, experimentalStyled as styled, buttonClasses } from '@material-ui/core'

export default styled(Button)(({ theme }) => ({
    [`&.${buttonClasses.root}`]: {
        padding: `${theme.spacing(1.5)} ${theme.spacing(2)}`,
        borderRadius: 24,
        minWidth: 140,
    },
}))
