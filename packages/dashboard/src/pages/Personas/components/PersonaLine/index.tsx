import { memo, MouseEvent, ReactNode } from 'react'
import { Box, Link, Typography } from '@material-ui/core'
import { MaskColorVar } from '@masknet/theme'
import { useDashboardI18N } from '../../../../locales'
import { FacebookColoredIcon, MindsIcon, TwitterColoredIcon } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'

const useStyles = makeStyles()((theme) => ({
    connect: {
        '& svg': {
            fontSize: '18px',
            marginRight: theme.spacing(1.5),
        },
    },
}))
export interface UnconnectedPersonaLineProps {
    onConnect: () => void
    networkIdentifier: string
}

// todo: merge
const ICON_MAPPING: Record<string, ReactNode> = {
    'facebook.com': <FacebookColoredIcon />,
    'twitter.com': <TwitterColoredIcon />,
    'minds.com': <MindsIcon />,
}

export const UnconnectedPersonaLine = memo<UnconnectedPersonaLineProps>(({ onConnect, networkIdentifier }) => {
    const t = useDashboardI18N()
    const { classes } = useStyles()
    return (
        <Box className={classes.connect} sx={{ display: 'flex', alignItems: 'center' }}>
            <Link
                underline="none"
                onClick={(e: MouseEvent) => {
                    e.stopPropagation()
                    onConnect()
                }}
                sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                }}>
                {ICON_MAPPING[networkIdentifier]}
                <Typography variant="caption" sx={{ color: MaskColorVar.textPrimary }}>
                    {t.personas_connect_to({ internalName: networkIdentifier })}
                </Typography>
            </Link>
        </Box>
    )
})

export interface ConnectedPersonaLineProps {
    onDisconnect: () => void
    userId: string
    networkIdentifier: string
}

export const ConnectedPersonaLine = memo<ConnectedPersonaLineProps>(({ userId, onDisconnect, networkIdentifier }) => {
    const t = useDashboardI18N()
    const { classes } = useStyles()
    return (
        <Box className={classes.connect} sx={{ display: 'flex', alignItems: 'center' }}>
            <Link
                underline="none"
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                }}>
                <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                    {ICON_MAPPING[networkIdentifier]}
                    <Typography variant="caption" sx={{ color: MaskColorVar.textPrimary }}>
                        @{userId}
                    </Typography>
                </Box>
                <Link
                    component="button"
                    variant="caption"
                    onClick={(e: MouseEvent) => {
                        e.stopPropagation()
                        onDisconnect()
                    }}>
                    {t.personas_disconnect()}
                </Link>
            </Link>
        </Box>
    )
})
