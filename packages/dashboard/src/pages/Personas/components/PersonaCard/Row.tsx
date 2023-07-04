import { memo, useContext, useState } from 'react'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { Box, IconButton, MenuItem, Stack, Typography } from '@mui/material'
import { ConnectedPersonaLine, UnconnectedPersonaLine } from '../PersonaLine/index.js'
import {
    type PersonaIdentifier,
    type ProfileIdentifier,
    type ProfileInformation,
    DashboardRoutes,
    NextIDAction,
} from '@masknet/shared-base'
import { useMenu, usePersonaProofs } from '@masknet/shared'
import { useDashboardI18N } from '../../../../locales/index.js'
import { PersonaContext } from '../../hooks/usePersonaContext.js'
import { RenameDialog } from '../RenameDialog/index.js'
import type { SocialNetwork } from '../../api.js'
import { useAsync, useToggle } from 'react-use'
import { UploadAvatarDialog } from '../UploadAvatarDialog/index.js'
import { MaskAvatar } from '../../../../components/MaskAvatar/index.js'
import { useNavigate } from 'react-router-dom'
import { LogoutPersonaDialog } from '../LogoutPersonaDialog/index.js'
import { UserContext } from '../../../Settings/hooks/UserContext.js'
import { styled } from '@mui/material/styles'
import { PreviewDialog as ExportPersonaDialog } from '../../../SignUp/steps/PreviewDialog.js'
import { useExportPrivateKey } from '../../hooks/useExportPrivateKey.js'
import { useExportMnemonicWords } from '../../hooks/useExportMnemonicWords.js'
import { PluginServices } from '../../../../API.js'
import { useWallets } from '@masknet/web3-hooks-base'
import { isSameAddress } from '@masknet/web3-shared-base'

const useStyles = makeStyles()((theme) => ({
    setting: {
        fontSize: 18,
        padding: 0,
        position: 'absolute',
        right: -14,
        top: -14,
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
    const wallets = useWallets()
    const { currentPersona, connectPersona, disconnectPersona, renamePersona, deleteBound, definedSocialNetworks } =
        PersonaContext.useContainer()

    const { value: hasPaymentPassword = false } = useAsync(PluginServices.Wallet.hasPassword, [])
    if (!currentPersona?.identifier.publicKeyAsHex) return null

    return (
        <PersonaRowCardUI
            hasSmartPay={!!wallets.filter((x) => isSameAddress(x.owner, currentPersona.address)).length}
            hasPaymentPassword={hasPaymentPassword}
            publicKey={currentPersona.identifier.publicKeyAsHex}
            nickname={currentPersona.nickname}
            identifier={currentPersona.identifier}
            profiles={currentPersona.linkedProfiles}
            address={currentPersona.address}
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
    address?: string
    identifier: PersonaIdentifier
    profiles: ProfileInformation[]
    definedSocialNetworks: SocialNetwork[]
    publicKey: string
    hasSmartPay: boolean
    hasPaymentPassword: boolean
    onConnect: (
        identifier: PersonaIdentifier,
        networkIdentifier: string,
        type?: 'local' | 'nextID',
        profile?: ProfileIdentifier,
        openInNewTab?: boolean,
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

    const { nickname, definedSocialNetworks, identifier, profiles, publicKey, address } = props
    const { onConnect, onDisconnect, onRename, onDeleteBound } = props
    const { value: privateKey } = useExportPrivateKey(identifier)
    const { value: words } = useExportMnemonicWords(identifier)
    const proofs = usePersonaProofs(publicKey)
    const [avatarOn, toggleAvatar] = useToggle(false)
    const [renameDialogOpen, setRenameDialogOpen] = useState(false)
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
    const [exportPersonaDialogOpen, setExportPersonaDialogOpen] = useState(false)

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
        <MenuItem onClick={() => setLogoutDialogOpen(true)} style={{ color: MaskColorVar.redMain }}>
            <MenuText>{t.personas_logout()}</MenuText>
        </MenuItem>,
    )

    return (
        <Stack direction="row" alignItems="center" justifyContent="space-around" position="relative">
            {avatarOn ? <UploadAvatarDialog open={avatarOn} onClose={() => toggleAvatar(false)} /> : null}
            <IconButton
                onClick={(e) => {
                    e.stopPropagation()
                    openMenu(e)
                }}
                className={classes.setting}>
                <Icons.Settings color={MaskColorVar.textPrimary} />
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
                    <Box sx={{ mr: 1.5, py: '2px', height: '100%' }}>
                        <Icons.PublicKey size={18} />
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
                                    proofs={proofs.data}
                                    loading={proofs.isLoading}
                                    disableAdd={currentNetworkProfiles.length >= 5}
                                    isHideOperations={false}
                                    key={networkIdentifier}
                                    onConnect={(type, profile) =>
                                        onConnect(identifier, networkIdentifier, type, profile, false)
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
            {renameDialogOpen ? (
                <RenameDialog
                    open={renameDialogOpen}
                    nickname={nickname}
                    onClose={() => setRenameDialogOpen(false)}
                    onConfirm={async (name) => {
                        await onRename(identifier, name)
                        setRenameDialogOpen(false)
                    }}
                />
            ) : null}
            <LogoutPersonaDialog
                nickname={nickname}
                open={logoutDialogOpen}
                identifier={identifier}
                address={address}
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
