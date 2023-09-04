import { memo, type MouseEvent, useState } from 'react'
import { Box, Button, Link, Stack, Typography } from '@mui/material'
import { getMaskColor, MaskColorVar, makeStyles, LoadingBase } from '@masknet/theme'
import {
    type PersonaIdentifier,
    type ProfileIdentifier,
    type BindingProof,
    NextIDPlatform,
    EnhanceableSite,
    EMPTY_LIST,
} from '@masknet/shared-base'
import { SOCIAL_MEDIA_ICON_MAPPING } from '@masknet/shared'
import { Icons } from '@masknet/icons'
import { PersonaContext } from '../../hooks/usePersonaContext.js'
import { useDashboardI18N } from '../../../../locales/index.js'
import { DisconnectProfileDialog } from '../DisconnectProfileDialog/index.js'

const useStyles = makeStyles()((theme) => ({
    icon: {
        span: {
            height: 18,
            width: 18,
            marginRight: theme.spacing(1.5),
        },
    },
    link: {
        height: 28,
    },
    disabled: {
        opacity: 0.6,
        pointerEvents: 'none',
    },
    userIdBox: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(0.5),
    },
    proofIconBox: {
        display: 'flex',
        alignItems: 'center',
        ':hover': {
            opacity: 0.8,
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
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
                <span className={classes.icon}>{SOCIAL_MEDIA_ICON_MAPPING[networkIdentifier]}</span>
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
    onConnect: (type: 'nextID' | 'local', profile?: ProfileIdentifier) => void
    onDisconnect: (identifier: ProfileIdentifier) => void
    onDeleteBound?: (profile: ProfileIdentifier) => void
    profileIdentifiers: ProfileIdentifier[]
    networkIdentifier: string
    disableAdd?: boolean
    personaIdentifier: PersonaIdentifier
    loading: boolean
    proofs?: BindingProof[]
}

export const ConnectedPersonaLine = memo<ConnectedPersonaLineProps>(
    ({
        profileIdentifiers,
        onConnect,
        onDisconnect,
        onDeleteBound,
        networkIdentifier,
        isHideOperations,
        disableAdd,
        personaIdentifier,
        loading,
        proofs = EMPTY_LIST,
    }) => {
        const t = useDashboardI18N()
        const { openProfilePage } = PersonaContext.useContainer()
        const { classes } = useStyles()

        const [openDisconnectDialog, setOpenDisconnectDialog] = useState(false)

        const handleUserIdClick = async (network: string, userId: string) => {
            await openProfilePage(network, userId)
        }
        const handleProofIconClick = (e: MouseEvent, proof: BindingProof | undefined, profile: ProfileIdentifier) => {
            e.stopPropagation()
            if (!proof?.is_valid) {
                onConnect('nextID', profile)
            }
        }

        const handleDisconnect = (profile: ProfileIdentifier) => {
            const isProved = proofs.find((x) => {
                return x.platform === NextIDPlatform.Twitter && x.identity === profile.userId.toLowerCase()
            })
            if (isProved && onDeleteBound) {
                onDeleteBound(profile)
                return
            }
            onDisconnect(profile)
        }
        const userIdBox = (profile: ProfileIdentifier) => {
            const isProved = proofs.find((x) => {
                return x.platform === NextIDPlatform.Twitter && x.identity === profile.userId.toLowerCase()
            })

            return (
                <Box className={classes.userIdBox}>
                    <Typography variant="caption" sx={{ fontSize: 13 }}>
                        @{profile.userId}
                    </Typography>
                    {profile.network === EnhanceableSite.Twitter && (
                        <Typography
                            className={classes.proofIconBox}
                            onClick={(e: MouseEvent) => handleProofIconClick(e, isProved, profile)}>
                            {loading ? (
                                <LoadingBase />
                            ) : isProved?.is_valid ? (
                                <Icons.Verification size={18} />
                            ) : (
                                <Icons.NextIdPersonaWarning size={18} />
                            )}
                        </Typography>
                    )}
                </Box>
            )
        }
        return (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Link
                    underline="none"
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%',
                    }}>
                    <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                        <span className={classes.icon}>{SOCIAL_MEDIA_ICON_MAPPING[networkIdentifier]}</span>
                        <Stack flexWrap="wrap" flexDirection="row">
                            {profileIdentifiers.map((x) => (
                                <Typography
                                    variant="caption"
                                    key={x.userId}
                                    onClick={() => handleUserIdClick(networkIdentifier, x.userId)}
                                    sx={{ color: MaskColorVar.textPrimary, fontSize: 13, mr: 1, cursor: 'pointer' }}>
                                    {userIdBox(x)}
                                </Typography>
                            ))}
                        </Stack>
                    </Box>
                    {!isHideOperations && (
                        <Box>
                            <Link
                                component="button"
                                classes={{ button: classes.link, root: disableAdd ? classes.disabled : undefined }}
                                variant="caption"
                                sx={{ mr: 1 }}
                                onClick={(e: MouseEvent) => {
                                    e.stopPropagation()
                                    onConnect('local')
                                }}>
                                {t.personas_add()}
                            </Link>
                            <Link
                                sx={{ color: (theme) => getMaskColor(theme).redMain }}
                                component="button"
                                classes={{ button: classes.link }}
                                variant="caption"
                                onClick={() => setOpenDisconnectDialog(true)}>
                                {t.personas_disconnect_raw()}
                            </Link>
                        </Box>
                    )}
                </Link>
                <DisconnectProfileDialog
                    personaIdentifier={personaIdentifier}
                    networkIdentifier={networkIdentifier}
                    onDisconnect={(profileIdentifier) => handleDisconnect(profileIdentifier)}
                    profileIdentifiers={profileIdentifiers}
                    open={openDisconnectDialog}
                    onClose={() => setOpenDisconnectDialog(false)}
                />
            </Box>
        )
    },
)
