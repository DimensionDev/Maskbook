import { memo, useCallback, useState } from 'react'
import { Button, DialogActions, DialogContent, makeStyles, Typography } from '@material-ui/core'
import { AuthorIcon, EditIcon } from '@dimensiondev/icons'
import { MaskColorVar, MaskDialog } from '@dimensiondev/maskbook-theme'
import type { PersonaProvider, SocialNetworkProvider } from '../../type'
import { PersonaLine } from '../PersonaLine'
import type { PersonaIdentifier, ProfileIdentifier } from '@dimensiondev/maskbook-shared'
import { RenameDialog } from '../RenameDialog'
import { useDashboardI18N } from '../../../../locales'
import { PersonaState } from '../../hooks/usePersonaState'

const useStyles = makeStyles((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing(7, 7, 4, 7),
    },
    buttons: {
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(2,24%)',
        justifyContent: 'center',
        gridColumnGap: theme.spacing(2),
        marginTop: theme.spacing(5.5),
    },
    name: {
        display: 'flex',
        alignItems: 'center',
        marginTop: theme.spacing(3),
    },
    content: {
        width: '100%',
        marginTop: theme.spacing(7),
    },
    author: {
        fontSize: 60,
        fill: MaskColorVar.secondaryBackground,
    },
    edit: {
        fontSize: theme.typography.subtitle1.fontSize,
        fill: 'none',
        marginLeft: theme.spacing(1.5),
        cursor: 'pointer',
    },
}))

export interface EditPersonaDialogProps {
    open: boolean
    onClose: () => void
    providers: PersonaProvider[]
    nickname?: string
    identifier: PersonaIdentifier
}

export const EditPersonaDialog = memo<EditPersonaDialogProps>((props) => {
    const { onConnect, onDisConnect, onRename } = PersonaState.useContainer()

    return <EditPersonaDialogUI {...props} onConnect={onConnect} onDisConnect={onDisConnect} onRename={onRename} />
})

export interface EditPersonaDialogUIProps extends EditPersonaDialogProps {
    onConnect: (identifier: PersonaIdentifier, provider: SocialNetworkProvider) => void
    onDisConnect: (identifier?: ProfileIdentifier) => void
    onRename: (target: string, identifier: PersonaIdentifier, callback?: () => void) => void
}

export const EditPersonaDialogUI = memo<EditPersonaDialogUIProps>(
    ({ open, onClose, nickname, providers, identifier, onConnect, onDisConnect, onRename }) => {
        const classes = useStyles()
        const t = useDashboardI18N()

        const [renameOpen, setRenameOpen] = useState(false)

        const onConfirm = useCallback(
            (name: string) => {
                onRename(name, identifier)
                setRenameOpen(false)
            },
            [onRename, identifier],
        )

        return (
            <>
                <MaskDialog open={open} title={t.personas_edit_dialog_title()} onClose={onClose}>
                    <DialogContent className={classes.container}>
                        <AuthorIcon className={classes.author} />
                        <Typography variant="caption" classes={{ root: classes.name }}>
                            {nickname}
                            <EditIcon className={classes.edit} onClick={() => setRenameOpen(true)} />
                        </Typography>
                        <div className={classes.content}>
                            {providers.map((provider) => {
                                return (
                                    <PersonaLine
                                        key={provider.networkIdentifier}
                                        onConnect={() => onConnect(identifier, provider)}
                                        onDisConnect={() => onDisConnect(provider?.identifier)}
                                        {...provider}
                                    />
                                )
                            })}
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button color="secondary">{t.personas_cancel()}</Button>
                        <Button>{t.personas_confirm()}</Button>
                    </DialogActions>
                </MaskDialog>
                <RenameDialog
                    open={renameOpen}
                    nickname={nickname}
                    onClose={() => setRenameOpen(false)}
                    onConfirm={onConfirm}
                />
            </>
        )
    },
)
