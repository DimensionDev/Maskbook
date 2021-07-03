import { experimentalStyled as styled } from '@material-ui/core/styles'
import { buttonClasses } from '@material-ui/core'

export const ButtonGroup = styled('div')(({ theme }) => ({
    margin: '56px auto',
    display: 'flex',
    justifyContent: 'space-around',
    width: 500,

    [`& > .${buttonClasses.root}`]: {
        width: 225,
        height: 48,
        borderRadius: theme.spacing(3),
        fontSize: 16,
    },
}))
