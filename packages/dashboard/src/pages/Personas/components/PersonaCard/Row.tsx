import { memo, useState } from 'react'
import { makeStyles } from '@masknet/theme'
import { MaskColorVar } from '@masknet/theme'
import { AuthorIcon, SettingsIcon } from '@masknet/icons'
import { Box, IconButton, MenuItem, Stack, Typography } from '@material-ui/core'
import { ConnectedPersonaLine, UnconnectedPersonaLine } from '../PersonaLine'
import { PersonaIdentifier, ProfileIdentifier, ProfileInformation, useMenu } from '@masknet/shared'
import { DeletePersonaDialog } from '../DeletePersonaDialog'
import { useDashboardI18N } from '../../../../locales'
import { PersonaContext } from '../../hooks/usePersonaContext'
import { RenameDialog } from '../RenameDialog'
import type { SocialNetwork } from '../../api'
import { useAccount } from '@masknet/web3-shared'
import { PublicKeyIcon } from '@masknet/icons'

const useStyles = makeStyles()((theme) => ({
    setting: {
        fontSize: 18,
        padding: 0,
        position: 'absolute',
        right: '-1rem',
        top: '-1rem',
    },
    icon: {
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
    const account = useAccount()

    if (!currentPersona) return null

    return (
        <PersonaRowCardUI
            account={account}
            nickname={currentPersona.nickname}
            identifier={currentPersona.identifier}
            profiles={currentPersona.linkedProfiles}
            onConnect={connectPersona}
            onDisconnect={disconnectPersona}
            onRename={renamePersona}
            definedSocialNetworks={definedSocialNetworks.filter((x) => !x.networkIdentifier.includes('instagram'))}
        />
    )
})

export interface PersonaRowCardUIProps {
    account: string
    nickname?: string
    identifier: PersonaIdentifier
    profiles: ProfileInformation[]
    definedSocialNetworks: SocialNetwork[]
    onConnect: (identifier: PersonaIdentifier, networkIdentifier: string) => void
    onDisconnect: (identifier: ProfileIdentifier) => void
    onRename: (identifier: PersonaIdentifier, target: string, callback?: () => void) => void
}

export const PersonaRowCardUI = memo<PersonaRowCardUIProps>((props) => {
    const { account, nickname, definedSocialNetworks, identifier, profiles } = props
    const { onConnect, onDisconnect, onRename } = props

    const t = useDashboardI18N()
    const { classes } = useStyles()
    const [renameDialogOpen, setRenameDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [menu, openMenu] = useMenu(
        <MenuItem onClick={() => setRenameDialogOpen(true)}>{t.personas_edit()}</MenuItem>,
        <MenuItem onClick={() => setDeleteDialogOpen(true)} style={{ color: MaskColorVar.redMain }}>
            {t.personas_delete()}
        </MenuItem>,
    )

    return (
        <Stack direction="row" alignItems="center" justifyContent="space-around" position="relative">
            <IconButton
                onClick={(e) => {
                    e.stopPropagation()
                    openMenu(e)
                }}
                className={classes.setting}>
                <SettingsIcon fontSize="inherit" style={{ fill: MaskColorVar.textPrimary }} />
            </IconButton>
            <Stack direction="row" alignItems="center" justifyContent="center" flex={1}>
                <Box textAlign="center" className={classes.icon}>
                    <AuthorIcon />
                    <Typography variant="body1" sx={{ cursor: 'pointer' }}>
                        {nickname}
                    </Typography>
                </Box>
            </Stack>
            <Box sx={{ flex: 3 }}>
                <Box
                    sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                    }}>
                    <Box sx={{ mr: 1.5 }} className={classes.accountIcon}>
                        <PublicKeyIcon />
                    </Box>
                    <Typography variant="body1" sx={{ fontSize: 13 }} component="span">
                        {account}
                    </Typography>
                </Box>
                <Box>
                    {definedSocialNetworks.map(({ networkIdentifier }) => {
                        const profile = profiles?.find((x) => x.identifier.network === networkIdentifier)
                        if (profile) {
                            return (
                                <Box key={networkIdentifier} sx={{ mt: 1 }}>
                                    <ConnectedPersonaLine
                                        onDisconnect={() => onDisconnect(profile.identifier)}
                                        userId={profile.identifier.userId}
                                        networkIdentifier={networkIdentifier}
                                    />
                                </Box>
                            )
                        } else {
                            return (
                                <Box key={networkIdentifier} sx={{ mt: 1 }}>
                                    <UnconnectedPersonaLine
                                        key={networkIdentifier}
                                        onConnect={() => onConnect(identifier, networkIdentifier)}
                                        networkIdentifier={networkIdentifier}
                                    />
                                </Box>
                            )
                        }
                    })}
                </Box>
            </Box>
            {menu}
            <RenameDialog
                open={renameDialogOpen}
                nickname={nickname}
                onClose={() => setRenameDialogOpen(false)}
                onConfirm={(name) => {
                    onRename(identifier, name)
                    setRenameDialogOpen(false)
                }}
            />
            <DeletePersonaDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                nickname={nickname}
            />
        </Stack>
    )
})
