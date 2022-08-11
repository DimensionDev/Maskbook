import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { Box, CircularProgress, Typography } from '@mui/material'
import type { FC } from 'react'
import { useI18N } from '../../locales'

interface Props {
    loading?: boolean
    empty?: boolean
    description?: string
}

const useStyles = makeStyles()((theme) => ({
    statusBox: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: theme.spacing(6),
        height: 380,
        flexDirection: 'column',
    },
}))

export const StatusBox: FC<Props> = ({ loading, empty, description }) => {
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
                <Icons.EmptySimple size={32} />
                <Typography
                    marginTop="10px"
                    color={(theme) => theme.palette.maskColor.second}
                    fontSize="14px"
                    fontWeight={400}>
                    {description}
                </Typography>
            </Box>
        )
    }
    return null
}
