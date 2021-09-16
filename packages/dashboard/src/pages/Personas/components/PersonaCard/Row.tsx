import { memo, useContext, useState } from 'react'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { PublicKeyIcon, SettingsIcon } from '@masknet/icons'
import { Box, IconButton, MenuItem, Stack, Typography } from '@material-ui/core'
import { ConnectedPersonaLine, UnconnectedPersonaLine } from '../PersonaLine'
import { PersonaIdentifier, ProfileIdentifier, ProfileInformation, useMenu } from '@masknet/shared'
import { useDashboardI18N } from '../../../../locales'
import { PersonaContext } from '../../hooks/usePersonaContext'
import { RenameDialog } from '../RenameDialog'
import type { SocialNetwork } from '../../api'
import { useToggle } from 'react-use'
import { UploadAvatarDialog } from '../UploadAvatarDialog'
import { MaskAvatar } from '../../../../components/MaskAvatar'
import { ExportPrivateKeyDialog } from '../ExportPrivateKeyDialog'
import { RoutePaths } from '../../../../type'
import { useNavigate } from 'react-router'
import { LogoutPersonaDialog } from '../LogoutPersonaDialog'
import { UserContext } from '../../../Settings/hooks/UserContext'

const useStyles = makeStyles()((theme) => ({
    setting: {
        fontSize: 18,
        padding: 0,
        position: 'absolute',
        right: '-1rem',
        top: '-1rem',
    },
    icon: {
        cursor: 'pointer',
        '&>svg': {
            fontSize: '96px',
        },
    },
    accountIcon: {
        '&>svg': {
            fontSize: '18px',
        },
    },
}))

export const PersonaRowCard = memo(() => {
    const { currentPersona, connectPersona, disconnectPersona, renamePersona, definedSocialNetworks } =
        PersonaContext.useContainer()

    if (!currentPersona) return null

    return (
        <PersonaRowCardUI
            nickname={currentPersona.nickname}
            identifier={currentPersona.identifier}
            profiles={currentPersona.linkedProfiles}
            onConnect={connectPersona}
            onDisconnect={disconnectPersona}
            onRename={renamePersona}
            definedSocialNetworks={definedSocialNetworks}
        />
    )
})

export interface PersonaRowCardUIProps {
    nickname?: string
    identifier: PersonaIdentifier
    profiles: ProfileInformation[]
    definedSocialNetworks: SocialNetwork[]
    onConnect: (identifier: PersonaIdentifier, networkIdentifier: string) => void
    onDisconnect: (identifier: ProfileIdentifier) => void
    onRename: (identifier: PersonaIdentifier, target: string, callback?: () => void) => Promise<void>
}

export const PersonaRowCardUI = memo<PersonaRowCardUIProps>((props) => {
    const navigate = useNavigate()
    const t = useDashboardI18N()
    const { classes } = useStyles()
    const { confirmPassword } = useContext(UserContext)

    const { nickname, definedSocialNetworks, identifier, profiles } = props
    const { onConnect, onDisconnect, onRename } = props

    const [avatarOn, toggleAvatar] = useToggle(false)
    const [renameDialogOpen, setRenameDialogOpen] = useState(false)
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
    const [exportPrivateKeyDialogOpen, setExportPrivateKeyDialogOpen] = useState(false)

    const logoutConfirmedPasswordCallback = () =>
        confirmPassword(() => setLogoutDialogOpen(true), {
            tipTitle: t.personas_logout(),
            tipContent: t.personas_logout_confirm_password_tip(),
            confirmTitle: t.personas_logout(),
        })

    const exportPrivateKeyConfirmedPasswordCallback = () =>
        confirmPassword(() => setExportPrivateKeyDialogOpen(true), {
            tipTitle: t.personas_export_persona(),
            tipContent: t.personas_export_persona_confirm_password_tip(),
            confirmTitle: t.personas_export_persona(),
        })

    const [menu, openMenu] = useMenu(
        <MenuItem onClick={() => setRenameDialogOpen(true)}>{t.personas_rename()}</MenuItem>,
        <MenuItem onClick={exportPrivateKeyConfirmedPasswordCallback}>{t.personas_export_private()}</MenuItem>,
        <MenuItem onClick={() => navigate(RoutePaths.Settings, { state: { open: 'setting' } })}>
            {t.settings_global_backup_title()}
        </MenuItem>,
        <MenuItem onClick={logoutConfirmedPasswordCallback} style={{ color: MaskColorVar.redMain }}>
            {t.personas_logout()}
        </MenuItem>,
    )

    return (
        <Stack direction="row" alignItems="center" justifyContent="space-around" position="relative">
            {avatarOn && <UploadAvatarDialog open={avatarOn} onClose={() => toggleAvatar(false)} />}
            <IconButton
                onClick={(e) => {
                    e.stopPropagation()
                    openMenu(e)
                }}
                className={classes.setting}>
                <SettingsIcon fontSize="inherit" style={{ fill: MaskColorVar.textPrimary }} />
            </IconButton>
            <Stack direction="row" alignItems="center" justifyContent="center" flex={1}>
                <Box textAlign="center" className={classes.icon} onClick={() => toggleAvatar(true)}>
                    <MaskAvatar size={96} />
                    <Typography variant="body1" sx={{ cursor: 'pointer' }}>
                        {nickname}
                    </Typography>
                </Box>
            </Stack>
            <Box sx={{ flex: 3 }}>
                <Box
                    height={22}
                    sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                    }}>
                    <Box sx={{ mr: 1.5, py: '2px', height: '100%' }} className={classes.accountIcon}>
                        <PublicKeyIcon />
                    </Box>
                    <Typography variant="body1" sx={{ fontSize: 13 }} component="span">
                        {identifier.compressedPoint}
                    </Typography>
                </Box>
                <Box>
                    {definedSocialNetworks.map(({ networkIdentifier }) => {
                        const currentNetworkProfiles = profiles.filter(
                            (x) => x.identifier.network === networkIdentifier,
                        )

                        currentNetworkProfiles.map(() => {})
                        if (!currentNetworkProfiles.length) {
                            return (
                                <UnconnectedPersonaLine
                                    key={networkIdentifier}
                                    onConnect={() => onConnect(identifier, networkIdentifier)}
                                    networkIdentifier={networkIdentifier}
                                />
                            )
                        } else {
                            return (
                                <ConnectedPersonaLine
                                    isHideOperations={false}
                                    key={networkIdentifier}
                                    onConnect={() => onConnect(identifier, networkIdentifier)}
                                    onDisconnect={onDisconnect}
                                    profileIdentifiers={currentNetworkProfiles.map((x) => x.identifier)}
                                    networkIdentifier={networkIdentifier}
                                />
                            )
                        }
                    })}
                </Box>
            </Box>
            {menu}
            {renameDialogOpen && (
                <RenameDialog
                    open={renameDialogOpen}
                    nickname={nickname}
                    onClose={() => setRenameDialogOpen(false)}
                    onConfirm={async (name) => {
                        await onRename(identifier, name)
                        setRenameDialogOpen(false)
                    }}
                />
            )}
            <LogoutPersonaDialog
                open={logoutDialogOpen}
                identifier={identifier}
                onClose={() => setLogoutDialogOpen(false)}
            />
            <ExportPrivateKeyDialog
                open={exportPrivateKeyDialogOpen}
                identifier={identifier}
                onClose={() => setExportPrivateKeyDialogOpen(false)}
            />
        </Stack>
    )
})
