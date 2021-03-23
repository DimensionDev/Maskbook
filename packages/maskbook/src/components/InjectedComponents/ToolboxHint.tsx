import { Box, makeStyles, Typography } from '@material-ui/core'
import { MaskbookSharpIcon } from '../../resources/MaskbookIcon'

const useStyles = makeStyles((theme) => ({
    wrapper: {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        padding: '8px 10px',
    },
}))

export function ToolboxHint() {
    const classes = useStyles()

    return (
        <Box className={classes.wrapper}>
            <MaskbookSharpIcon />
            <Typography>Mask</Typography>
        </Box>
    )
}
