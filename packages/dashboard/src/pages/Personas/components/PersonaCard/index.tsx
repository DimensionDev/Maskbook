import { memo, useState } from 'react'
import { makeStyles } from '@masknet/theme'
import { MaskColorVar } from '@masknet/theme'
import { SettingsIcon } from '@masknet/icons'
import { IconButton, MenuItem, Typography } from '@material-ui/core'
import { ConnectedPersonaLine, UnconnectedPersonaLine } from '../PersonaLine'
import { PersonaIdentifier, ProfileIdentifier, ProfileInformation, useMenu } from '@masknet/shared'
import { DeletePersonaDialog } from '../DeletePersonaDialog'
import { useDashboardI18N } from '../../../../locales'
import { PersonaContext } from '../../hooks/usePersonaContext'
import { RenameDialog } from '../RenameDialog'
import type { SocialNetwork } from '../../api'
import classNames from 'classnames'
import { ExportPrivateKeyDialog } from '../ExportPrivateKeyDialog'

const useStyles = makeStyles()((theme) => ({
    card: {
        borderRadius: Number(theme.shape.borderRadius) * 3,
        backgroundColor: MaskColorVar.primaryBackground,
        display: 'flex',
        padding: theme.spacing(1.25),
        minWidth: 320,
    },
    status: {
        width: 10,
        height: 10,
        borderRadius: '50%',
        marginRight: theme.spacing(1.25),
        marginTop: theme.spacing(0.625),
    },
    statusInactivated: {
        backgroundColor: MaskColorVar.iconLight,
    },
    statusActivated: {
        backgroundColor: MaskColorVar.greenMain,
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: theme.typography.caption.fontSize,
    },
    content: {
        marginTop: theme.spacing(1.25),
        paddingRight: theme.spacing(1.25),
    },
    line: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: theme.typography.caption.fontSize,
    },
    setting: {
        fontSize: theme.typography.caption.fontSize,
        padding: 0,
    },
}))

export interface PersonaCardProps {
    nickname?: string
    active?: boolean
    identifier: PersonaIdentifier
    profiles: ProfileInformation[]
    onClick(): void
}

export const PersonaCard = memo<PersonaCardProps>((props) => {
    const { connectPersona, disconnectPersona, renamePersona, definedSocialNetworks } = PersonaContext.useContainer()

    return (
        <PersonaCardUI
            {...props}
            onConnect={connectPersona}
            onDisconnect={disconnectPersona}
            onRename={renamePersona}
            definedSocialNetworks={definedSocialNetworks}
        />
    )
})

export interface PersonaCardUIProps extends PersonaCardProps {
    definedSocialNetworks: SocialNetwork[]
    onConnect: (identifier: PersonaIdentifier, networkIdentifier: string) => void
    onDisconnect: (identifier: ProfileIdentifier) => void
    onRename: (identifier: PersonaIdentifier, target: string, callback?: () => void) => void
}

export const PersonaCardUI = memo<PersonaCardUIProps>((props) => {
    const { nickname, active = false, definedSocialNetworks, identifier, profiles } = props
    const { onConnect, onDisconnect, onClick, onRename } = props
    const t = useDashboardI18N()
    const { classes } = useStyles()
    const [renameDialogOpen, setRenameDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [exportPrivateKeyDialogOpen, setExportPrivateKeyDialogOpen] = useState(false)

    const [menu, openMenu] = useMenu(
        <MenuItem onClick={() => setRenameDialogOpen(true)}>{t.personas_edit()}</MenuItem>,
        <MenuItem onClick={() => setExportPrivateKeyDialogOpen(true)}>{t.personas_export_private()}</MenuItem>,
        <MenuItem onClick={() => setDeleteDialogOpen(true)} style={{ color: MaskColorVar.redMain }}>
            {t.personas_delete()}
        </MenuItem>,
    )

    return (
        <div className={classes.card}>
            <div className={classNames(classes.status, active ? classes.statusActivated : classes.statusInactivated)} />
            <div style={{ flex: 1 }}>
                <div className={classes.header}>
                    <Typography variant="subtitle2" sx={{ cursor: 'pointer' }} onClick={onClick}>
                        {nickname}
                    </Typography>
                    <IconButton
                        size="large"
                        onClick={(e) => {
                            e.stopPropagation()
                            openMenu(e)
                        }}
                        className={classes.setting}>
                        <SettingsIcon fontSize="inherit" style={{ fill: MaskColorVar.textPrimary }} />
                    </IconButton>
                </div>
                <div className={classes.content}>
                    {definedSocialNetworks.map(({ networkIdentifier }) => {
                        const profile = profiles.find((x) => x.identifier.network === networkIdentifier)
                        if (profile) {
                            return (
                                <ConnectedPersonaLine
                                    key={networkIdentifier}
                                    onDisconnect={() => onDisconnect(profile.identifier)}
                                    userId={profile.identifier.userId}
                                />
                            )
                        } else {
                            return (
                                <UnconnectedPersonaLine
                                    key={networkIdentifier}
                                    onConnect={() => onConnect(identifier, networkIdentifier)}
                                    networkIdentifier={networkIdentifier}
                                />
                            )
                        }
                    })}
                </div>
            </div>
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
            <ExportPrivateKeyDialog
                open={exportPrivateKeyDialogOpen}
                identifier={identifier}
                onClose={() => setExportPrivateKeyDialogOpen(false)}
            />
        </div>
    )
})
