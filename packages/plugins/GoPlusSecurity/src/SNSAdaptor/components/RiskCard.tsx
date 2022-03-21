import { memo } from 'react'
import { DefineMapping } from './Common'
import { Box, Stack, Typography } from '@mui/material'
import type { SecurityMessage } from '../rules'
import { useI18N } from '../../locales'
import { makeStyles } from '@masknet/theme'

const useStyles = makeStyles()((theme) => ({
    detectionCard: {
        backgroundColor: theme.palette.background.default,
        borderRadius: 8,
    },
    header: {
        fontSize: 14,
    },
    description: {
        fontSize: 12,
    },
}))

interface RiskCardProps {
    info: SecurityMessage
}

export const RiskCard = memo<RiskCardProps>(({ info }) => {
    const t = useI18N()
    const { classes } = useStyles()
    return (
        <Stack spacing={1} key={info.titleKey} p={1.5} direction="row" className={classes.detectionCard}>
            <Box>{DefineMapping[info.level].icon()}</Box>
            <Box>
                <Typography classes={classes.header} color={DefineMapping[info.level].titleColor}>
                    {t[info.titleKey]()}
                </Typography>
                <Typography classes={classes.description}>{t[info.messageKey]()}</Typography>
            </Box>
        </Stack>
    )
})
