import type { ReactNode } from 'react'
import { Box, Typography } from '@mui/material'
import type { EnhanceableSite } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: theme.spacing(2),
    },
    item: {
        background: theme.vars.palette.maskColor.bg,
        padding: theme.spacing(1.5),
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
    },
    networkIcon: {
        width: 24,
        height: 24,
    },
    network: {
        marginLeft: 8,
        color: theme.vars.palette.maskColor.second,
        fontSize: 12,
        lineHeight: '16px',
        fontWeight: 700,
    },
}))

export interface ConnectSocialAccountsProps {
    networks: ReadonlyArray<{
        networkIdentifier: EnhanceableSite
        /** The site's round icon, already resolved by the container (e.g. SOCIAL_MEDIA_ROUND_ICON_MAPPING). */
        icon: ReactNode
        name: ReactNode
    }>
    onConnect: (networkIdentifier: EnhanceableSite) => void
}

export const ConnectSocialAccounts = function ConnectSocialAccounts({
    networks,
    onConnect,
}: ConnectSocialAccountsProps) {
    const { classes } = useStyles()

    return (
        <Box className={classes.container}>
            {networks.map(({ networkIdentifier, icon, name }) => (
                <Box className={classes.item} key={networkIdentifier} onClick={() => onConnect(networkIdentifier)}>
                    <div className={classes.networkIcon}>{icon}</div>
                    <Typography className={classes.network}>{name}</Typography>
                </Box>
            ))}
        </Box>
    )
}
