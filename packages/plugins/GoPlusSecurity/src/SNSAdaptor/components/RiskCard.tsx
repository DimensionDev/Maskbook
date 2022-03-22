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
    icon: {
        display: 'inline-flex',
        lineHeight: '22px',
        height: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        fontSize: 14,
        lineHeight: '22px',
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
            <Box className={classes.icon}>{DefineMapping[info.level].icon(14)}</Box>
            <Box>
                <Typography className={classes.header} color={DefineMapping[info.level].titleColor}>
                    {t[info.titleKey]()}
                </Typography>
                <Typography className={classes.description}>{t[info.messageKey]()}</Typography>
            </Box>
        </Stack>
    )
})
