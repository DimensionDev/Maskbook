import { makeStyles } from '@masknet/theme'
import { Box, CircularProgress, Typography } from '@mui/material'
import type { FC } from 'react'

interface Props {
    loading?: boolean
    empty?: boolean
}

const useStyles = makeStyles()((theme) => ({
    statusBox: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: theme.spacing(6),
    },
}))

export const StatusBox: FC<Props> = ({ loading, empty }) => {
    const { classes } = useStyles()
    if (loading) {
        return (
            <Box className={classes.statusBox}>
                <CircularProgress />
            </Box>
        )
    }

    if (empty) {
        return (
            <Box className={classes.statusBox}>
                <Typography color="textPrimary">No data.</Typography>
            </Box>
        )
    }
    return null
}
