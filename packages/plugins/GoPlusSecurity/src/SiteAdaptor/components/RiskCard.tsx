import { memo, type ReactNode } from 'react'
import { Box, Stack, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import type { SecurityMessage, SecurityAPI } from '@masknet/web3-providers/types'
import { DefineMapping } from '../constants.js'
import { useLingui } from '@lingui/react'

const useStyles = makeStyles()((theme) => ({
    detectionCard: {
        borderRadius: 8,
        boxShadow:
            theme.palette.mode === 'light' ?
                '0px 0px 20px rgba(0, 0, 0, 0.05)'
            :   '0px 0px 20px rgba(255, 255, 255, 0.12)',
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
        fontSize: 16,
        fontWeight: 700,
        lineHeight: '22px',
    },
    description: {
        fontSize: 16,
        fontWeight: 400,
        color: theme.palette.maskColor.second,
    },
}))

interface RiskCardProps {
    info: SecurityMessage
    tokenSecurity: SecurityAPI.TokenSecurityType
}

export const RiskCard = memo<RiskCardProps>(({ info, tokenSecurity }) => {
    const { _ } = useLingui()
    const title = typeof info.title === 'function' ? info.title(tokenSecurity) : info.title
    return (
        <RiskCardUI
            icon={DefineMapping[info.level].icon(14)}
            title={_(title)}
            titleColor={DefineMapping[info.level].titleColor}
            description={_(info.message)}
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
                {description ?
                    <Typography className={classes.description}>{description}</Typography>
                :   null}
            </Box>
        </Stack>
    )
})
