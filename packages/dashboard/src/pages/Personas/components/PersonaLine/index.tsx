import { memo, MouseEvent, useState } from 'react'
import { Box, Button, Link, Stack, Typography } from '@mui/material'
import { getMaskColor, MaskColorVar } from '@masknet/theme'
import { useDashboardI18N } from '../../../../locales'
import { makeStyles } from '@masknet/theme'
import { DisconnectProfileDialog } from '../DisconnectProfileDialog'
import { ProfileIdentifier, SOCIAL_MEDIA_ICON_MAPPING } from '@masknet/shared'
import { PersonaContext } from '../../hooks/usePersonaContext'

const useStyles = makeStyles()((theme) => ({
    connect: {
        '& svg': {
            fontSize: '18px',
            marginRight: theme.spacing(1.5),
        },
    },
    link: {
        height: 28,
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
                classes={{ button: classes.link }}
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
                    <Button variant="text" size="small" sx={{ fontSize: 13, p: 0 }}>
                        {t.personas_connect_to({ internalName: networkIdentifier })}
                    </Button>
                </Typography>
            </Link>
        </Box>
    )
})

export interface ConnectedPersonaLineProps {
    isHideOperations: boolean
    onConnect: () => void
    onDisconnect: (identifier: ProfileIdentifier) => void
    profileIdentifiers: ProfileIdentifier[]
    networkIdentifier: string
}

export const ConnectedPersonaLine = memo<ConnectedPersonaLineProps>(
    ({ profileIdentifiers, onConnect, onDisconnect, networkIdentifier, isHideOperations }) => {
        const t = useDashboardI18N()
        const { openProfilePage } = PersonaContext.useContainer()
        const { classes } = useStyles()

        const [openDisconnectDialog, setOpenDisconnectDialog] = useState(false)

        const handleUserIdClick = async (network: string, userId: string) => {
            await openProfilePage(network, userId)
        }

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
                        <Stack flexWrap="wrap" flexDirection="row">
                            {profileIdentifiers.map((x) => (
                                <Typography
                                    variant="caption"
                                    key={x.userId}
                                    onClick={() => handleUserIdClick(networkIdentifier, x.userId)}
                                    sx={{ color: MaskColorVar.textPrimary, fontSize: 13, mr: 1, cursor: 'pointer' }}>
                                    {`@${x.userId}`}
                                </Typography>
                            ))}
                        </Stack>
                    </Box>
                    {!isHideOperations && (
                        <Box>
                            <Link
                                component="button"
                                classes={{ button: classes.link }}
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
                                classes={{ button: classes.link }}
                                variant="caption"
                                onClick={() => setOpenDisconnectDialog(true)}>
                                {t.personas_disconnect()}
                            </Link>
                        </Box>
                    )}
                </Link>
                {openDisconnectDialog && (
                    <DisconnectProfileDialog
                        networkIdentifier={networkIdentifier}
                        onDisconnect={onDisconnect}
                        profileIdentifiers={profileIdentifiers}
                        open={openDisconnectDialog}
                        onClose={() => setOpenDisconnectDialog(false)}
                    />
                )}
            </Box>
        )
    },
)
