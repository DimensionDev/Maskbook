import { memo, MouseEvent } from 'react'
import { Box, Button, Link, Typography } from '@material-ui/core'
import { getMaskColor, MaskColorVar } from '@masknet/theme'
import { useDashboardI18N } from '../../../../locales'
import { makeStyles } from '@masknet/theme'
import { SOCIAL_MEDIA_ICON_MAPPING } from '../../../../constants'

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
                {SOCIAL_MEDIA_ICON_MAPPING[networkIdentifier]}
                <Typography variant="caption">
                    <Button variant="text" sx={{ fontSize: 13, p: 0 }}>
                        {t.personas_connect_to({ internalName: networkIdentifier })}
                    </Button>
                </Typography>
            </Link>
        </Box>
    )
})

export interface ConnectedPersonaLineProps {
    onConnect: () => void
    onDisconnect: () => void
    userId: string
    networkIdentifier: string
}

export const ConnectedPersonaLine = memo<ConnectedPersonaLineProps>(
    ({ userId, onConnect, onDisconnect, networkIdentifier }) => {
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
                        {SOCIAL_MEDIA_ICON_MAPPING[networkIdentifier]}
                        <Typography variant="caption" sx={{ color: MaskColorVar.textPrimary, fontSize: 13 }}>
                            @{userId}
                        </Typography>
                    </Box>
                    <Box>
                        <Link
                            component="button"
                            variant="caption"
                            sx={{ mr: 1 }}
                            onClick={(e: MouseEvent) => {
                                e.stopPropagation()
                                onConnect()
                            }}>
                            {t.personas_add()}
                        </Link>
                        <Link
                            sx={{ color: (theme) => getMaskColor(theme).redMain }}
                            component="button"
                            variant="caption"
                            onClick={(e: MouseEvent) => {
                                e.stopPropagation()
                                onDisconnect()
                            }}>
                            {t.personas_disconnect()}
                        </Link>
                    </Box>
                </Link>
            </Box>
        )
    },
)
