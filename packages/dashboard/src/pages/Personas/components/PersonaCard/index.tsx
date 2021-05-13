import { memo, useState } from 'react'
import { makeStyles, Theme } from '@material-ui/core/styles'
import { MaskColorVar } from '@dimensiondev/maskbook-theme'
import { SettingsIcon } from '@dimensiondev/icons'
import { IconButton, MenuItem, Typography } from '@material-ui/core'
import { ConnectedPersonaLine, UnconnectedPersonaLine } from '../PersonaLine'
import { PersonaIdentifier, ProfileIdentifier, ProfileInformation, useMenu } from '@dimensiondev/maskbook-shared'
import { DeletePersonaDialog } from '../DeletePersonaDialog'
import { useDashboardI18N } from '../../../../locales'
import { PersonaContext } from '../../hooks/usePersonaContext'
import { RenameDialog } from '../RenameDialog'
import { useProfiles } from '../../hooks/useProfiles'

const useStyles = makeStyles<Theme, { active: boolean }, 'card' | 'status' | 'header' | 'content' | 'line' | 'setting'>(
    (theme) => ({
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
            backgroundColor: ({ active }: { active: boolean }) =>
                active ? MaskColorVar.greenMain : MaskColorVar.iconLight,
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
    }),
)

export interface PersonaCardProps {
    nickname?: string
    active?: boolean
    identifier: PersonaIdentifier
    profiles: ProfileInformation[]
    onClick(): void
}

export const PersonaCard = memo<PersonaCardProps>((props) => {
    const { onConnect, onDisconnect, onRename } = PersonaContext.useContainer()

    return <PersonaCardUI {...props} onConnect={onConnect} onDisconnect={onDisconnect} onRename={onRename} />
})

export interface PersonaCardUIProps extends PersonaCardProps {
    onConnect: (networkIdentifier: string, identifier?: PersonaIdentifier) => void
    onDisconnect: (identifier?: ProfileIdentifier) => void
    onRename: (identifier: PersonaIdentifier, target: string, callback?: () => void) => void
}

export const PersonaCardUI = memo<PersonaCardUIProps>(
    ({ nickname, active = false, identifier, profiles: providers, onConnect, onDisconnect, onClick, onRename }) => {
        const t = useDashboardI18N()
        const classes = useStyles({ active })
        const [renameDialogOpen, setRenameDialogOpen] = useState(false)
        const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
        const [menu, openMenu] = useMenu(
            <MenuItem onClick={() => setRenameDialogOpen(true)}>{t.personas_edit()}</MenuItem>,
            <MenuItem onClick={() => setDeleteDialogOpen(true)} style={{ color: MaskColorVar.redMain }}>
                {t.personas_delete()}
            </MenuItem>,
        )

        const providerUIs = useProfiles(providers)

        return (
            <div className={classes.card}>
                <div className={classes.status} />
                <div style={{ flex: 1 }}>
                    <div className={classes.header}>
                        <Typography variant="subtitle2" sx={{ cursor: 'pointer' }} onClick={onClick}>
                            {nickname}
                        </Typography>
                        <IconButton
                            onClick={(e) => {
                                e.stopPropagation()
                                openMenu(e)
                            }}
                            className={classes.setting}>
                            <SettingsIcon fontSize="inherit" style={{ fill: MaskColorVar.textPrimary }} />
                        </IconButton>
                    </div>
                    <div className={classes.content}>
                        {providerUIs.map(({ networkIdentifier, provider }) => {
                            return provider ? (
                                <ConnectedPersonaLine
                                    key={networkIdentifier}
                                    onDisconnect={() => onDisconnect(provider.identifier)}
                                    userId={provider.identifier.userId}
                                />
                            ) : (
                                <UnconnectedPersonaLine
                                    key={networkIdentifier}
                                    onConnect={() => onConnect(networkIdentifier, identifier)}
                                    networkIdentifier={networkIdentifier}
                                />
                            )
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
            </div>
        )
    },
)
