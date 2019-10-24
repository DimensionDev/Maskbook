import { Paper, Theme } from '@material-ui/core'
import { styled } from '@material-ui/styles'

export default styled(Paper)(({ theme }: { theme?: Theme }) => ({
    padding: '2rem 1rem',
    maxWidth: 600,
    boxSizing: 'border-box',
    [theme!.breakpoints.down('xs')]: {
        boxShadow: 'none',
    },
}))
