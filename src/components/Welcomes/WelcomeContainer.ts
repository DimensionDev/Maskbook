import { Paper, Theme } from '@material-ui/core'
import { styled } from '@material-ui/styles'

export default styled(Paper)(({ theme }: { theme?: Theme }) => ({
    paddingBottom: '1rem',
    maxWidth: 600,
    width: '100%',
    boxSizing: 'border-box',
    [theme!.breakpoints.down('xs')]: {
        boxShadow: 'none',
    },
}))
