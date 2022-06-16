import { memo, ReactNode } from 'react'
import { DefineMapping, TokenSecurity } from './Common'
import { Box, Stack, Typography } from '@mui/material'
import type { SecurityMessage } from '../rules'
import { useSharedI18N } from '../../../../locales'
import { makeStyles } from '@masknet/theme'

const useStyles = makeStyles()((theme) => ({
    detectionCard: {
        borderRadius: 8,
        boxShadow:
            theme.palette.mode === 'light'
                ? '0px 0px 20px rgba(0, 0, 0, 0.05)'
                : '0px 0px 20px rgba(255, 255, 255, 0.12)',
        marginTop: '8px',
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
    tokenSecurity: TokenSecurity
}

export const RiskCard = memo<RiskCardProps>(({ info, tokenSecurity }) => {
    const t = useSharedI18N()
    return (
        <RiskCardUI
            icon={DefineMapping[info.level].icon(14)}
            title={t[info.titleKey]({ quantity: '', rate: info.i18nParams?.(tokenSecurity).rate ?? '', type: '' })}
            titleColor={DefineMapping[info.level].titleColor}
            description={t[info.messageKey]({
                quantity: '',
                rate: info.i18nParams?.(tokenSecurity).rate ?? '',
                type: '',
            })}
        />
    )
})

interface RiskCardUIProps {
    icon: ReactNode
    title: string
    titleColor: string
    description?: string
}

export const RiskCardUI = memo<RiskCardUIProps>(({ icon, title, titleColor, description }) => {
    const { classes } = useStyles()
    return (
        <Stack spacing={1} key={title} p={1.5} direction="row" className={classes.detectionCard}>
            <Box className={classes.icon}>{icon}</Box>
            <Box>
                <Typography className={classes.header} color={titleColor}>
                    {title}
                </Typography>
                {description && <Typography className={classes.description}>{description}</Typography>}
            </Box>
        </Stack>
    )
})
