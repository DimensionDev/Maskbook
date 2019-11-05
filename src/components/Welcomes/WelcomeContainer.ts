import { Paper, Theme } from '@material-ui/core'
import { styled } from '@material-ui/styles'

export default styled(Paper)(({ theme }: { theme?: Theme }) => ({
    textAlign: 'center',
    padding: '0.5rem 1rem 1rem',
    boxSizing: 'border-box',
    [theme!.breakpoints.down('xs')]: {
        boxShadow: 'none',
    },
}))
