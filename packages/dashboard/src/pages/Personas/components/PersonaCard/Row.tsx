import { memo, useContext, useState } from 'react'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { Icon } from '@masknet/icons'
import { Box, IconButton, MenuItem, Stack, Typography } from '@mui/material'
import { ConnectedPersonaLine, UnconnectedPersonaLine } from '../PersonaLine'
import {
    PersonaIdentifier,
    ProfileIdentifier,
    ProfileInformation,
    DashboardRoutes,
    NextIDAction,
} from '@masknet/shared-base'
import { useMenu } from '@masknet/shared'
import { useDashboardI18N } from '../../../../locales'
import { PersonaContext } from '../../hooks/usePersonaContext'
import { RenameDialog } from '../RenameDialog'
import type { SocialNetwork } from '../../api'
import { useToggle } from 'react-use'
import { UploadAvatarDialog } from '../UploadAvatarDialog'
import { MaskAvatar } from '../../../../components/MaskAvatar'
import { useNavigate } from 'react-router-dom'
import { LogoutPersonaDialog } from '../LogoutPersonaDialog'
import { UserContext } from '../../../Settings/hooks/UserContext'
import { styled } from '@mui/material/styles'
import { PreviewDialog as ExportPersonaDialog } from '../../../SignUp/steps/PreviewDialog'
import { useExportPrivateKey } from '../../hooks/useExportPrivateKey'
import { useExportMnemonicWords } from '../../hooks/useExportMnemonicWords'
import { usePersonaProof } from '../../hooks/usePersonaProof'

const useStyles = makeStyles()((theme) => ({
    setting: {
        fontSize: 18,
        padding: 0,
        position: 'absolute',
        right: '-1rem',
        top: '-1rem',
        [theme.breakpoints.down('md')]: {
            right: 0,
            top: 0,
        },
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
    avatar: {
        marginRight: theme.spacing(6),
        [theme.breakpoints.down('md')]: {
            marginRight: theme.spacing(3),
        },
    },
}))

const MenuText = styled('span')(`
    font-size: 14px;
`)

export const PersonaRowCard = memo(() => {
    const { currentPersona, connectPersona, disconnectPersona, renamePersona, deleteBound, definedSocialNetworks } =
        PersonaContext.useContainer()
    if (!currentPersona || !currentPersona.identifier.publicKeyAsHex) return null

    return (
        <PersonaRowCardUI
            publicKey={currentPersona.identifier.publicKeyAsHex}
            nickname={currentPersona.nickname}
            identifier={currentPersona.identifier}
            profiles={currentPersona.linkedProfiles}
            onConnect={connectPersona}
            onDisconnect={disconnectPersona}
            onDeleteBound={deleteBound}
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
    publicKey: string
    onConnect: (
        identifier: PersonaIdentifier,
        networkIdentifier: string,
        type?: 'local' | 'nextID',
        profile?: ProfileIdentifier,
    ) => void
    onDisconnect: (identifier: ProfileIdentifier) => void
    onRename: (identifier: PersonaIdentifier, target: string, callback?: () => void) => Promise<void>
    onDeleteBound: (
        identifier: PersonaIdentifier,
        profile: ProfileIdentifier,
        network: string,
        action: NextIDAction,
    ) => void
}

export const PersonaRowCardUI = memo<PersonaRowCardUIProps>((props) => {
    const navigate = useNavigate()
    const t = useDashboardI18N()
    const { classes } = useStyles()
    const { confirmPassword } = useContext(UserContext)

    const { nickname, definedSocialNetworks, identifier, profiles, publicKey } = props
    const { onConnect, onDisconnect, onRename, onDeleteBound } = props
    const { value: privateKey } = useExportPrivateKey(identifier)
    const { value: words } = useExportMnemonicWords(identifier)
    const proof = usePersonaProof(publicKey)
    const [avatarOn, toggleAvatar] = useToggle(false)
    const [renameDialogOpen, setRenameDialogOpen] = useState(false)
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
    const [exportPersonaDialogOpen, setExportPersonaDialogOpen] = useState(false)

    const logoutConfirmedPasswordCallback = () =>
        confirmPassword(() => setLogoutDialogOpen(true), {
            tipTitle: t.personas_logout(),
            tipContent: t.personas_logout_confirm_password_tip(),
            confirmTitle: t.personas_logout(),
            force: false,
        })

    const exportPersonaConfirmedPasswordCallback = () =>
        confirmPassword(() => setExportPersonaDialogOpen(true), {
            tipTitle: t.personas_export_persona(),
            tipContent: t.personas_export_persona_confirm_password_tip(),
            confirmTitle: t.personas_export_persona(),
        })

    const [menu, openMenu] = useMenu(
        <MenuItem onClick={() => setRenameDialogOpen(true)}>
            <MenuText>{t.personas_rename()}</MenuText>
        </MenuItem>,
        <MenuItem onClick={exportPersonaConfirmedPasswordCallback}>
            <MenuText>{t.personas_export_persona()}</MenuText>
        </MenuItem>,
        <MenuItem onClick={() => navigate(DashboardRoutes.Settings, { state: { open: 'setting' } })}>
            <MenuText>{t.settings_global_backup_title()}</MenuText>
        </MenuItem>,
        <MenuItem onClick={logoutConfirmedPasswordCallback} style={{ color: MaskColorVar.redMain }}>
            <MenuText>{t.personas_logout()}</MenuText>
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
                <Icon type="setting" color={MaskColorVar.textPrimary} />
            </IconButton>
            <Stack direction="row" alignItems="center" justifyContent="center" width="240px" className={classes.avatar}>
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
                        <Icon type="publicKey" />
                    </Box>
                    <Typography variant="body1" sx={{ fontSize: 13 }} component="span">
                        {identifier.rawPublicKey}
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
                                    proof={proof}
                                    disableAdd={currentNetworkProfiles.length >= 5}
                                    isHideOperations={false}
                                    key={networkIdentifier}
                                    onConnect={(type, profile) =>
                                        onConnect(identifier, networkIdentifier, type, profile)
                                    }
                                    onDisconnect={onDisconnect}
                                    onDeleteBound={(profile: ProfileIdentifier) => {
                                        onDeleteBound(identifier, profile, networkIdentifier, NextIDAction.Delete)
                                    }}
                                    profileIdentifiers={currentNetworkProfiles.map((x) => x.identifier)}
                                    networkIdentifier={networkIdentifier}
                                    personaIdentifier={identifier}
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
            <ExportPersonaDialog
                type="download"
                open={exportPersonaDialogOpen}
                onClose={() => setExportPersonaDialogOpen(false)}
                personaName={nickname || ''}
                id={identifier.toText()}
                words={words?.split(' ')}
                privateKey={privateKey || ''}
            />
        </Stack>
    )
})
