import { makeStyles } from '@masknet/theme'
import { Box, CircularProgress, Typography } from '@mui/material'
import type { FC } from 'react'
import { useI18N } from '../../locales'

interface Props {
    loading?: boolean
    empty?: boolean
    collection?: string
}

const useStyles = makeStyles()((theme) => ({
    statusBox: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: theme.spacing(6),
    },
}))

export const StatusBox: FC<Props> = ({ loading, empty, collection = 'Donation' }) => {
    const { classes } = useStyles()
    const t = useI18N()
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
                <Typography color="textPrimary">{t.no_data({ collection })}</Typography>
            </Box>
        )
    }
    return null
}
