import { Paper, Theme } from '@material-ui/core'
import { styled } from '@material-ui/styles'

export default styled(Paper)(({ theme }: { theme?: Theme }) => ({
    textAlign: 'center',
    padding: '2rem 1rem',
    boxSizing: 'border-box',
    [theme!.breakpoints.down('xs')]: {
        boxShadow: 'none',
    },
}))
