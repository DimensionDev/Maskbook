import { Box } from '@mui/material'
import useStyles from './useStyles'
import { ENSEmptyContent } from './ENSEmptyContent'

export function SearchResultInspector() {
    const { classes } = useStyles()

    return (
        <Box className={classes.root}>
            <ENSEmptyContent />
        </Box>
    )
}
