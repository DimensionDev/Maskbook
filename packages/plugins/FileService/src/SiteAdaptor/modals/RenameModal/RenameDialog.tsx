import { memo, type ReactNode, useState } from 'react'
import { Icons } from '@masknet/icons'
import { InjectedDialog, type InjectedDialogProps } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { Button, DialogContent, InputBase, Typography } from '@mui/material'
import { useFileServiceTrans } from '../../../locales/i18n_generated.js'

const useStyles = makeStyles()((theme) => ({
    paper: {
        minWidth: 320,
        width: 320,
        minHeight: 243,
        height: 243,
    },
    title: {
        fontSize: 24,
        lineHeight: '120%',
        fontWeight: 700,
        marginTop: theme.spacing(3),
        color: theme.palette.maskColor.main,
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 80,
        padding: theme.spacing(2),
        margin: theme.spacing(0),
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    message: {
        marginTop: theme.spacing(1.5),
        lineHeight: '18px',
        color: theme.palette.maskColor.second,
    },
    inputBox: {
        flexGrow: 1,
        textAlign: 'center',
        width: '100%',
        color: theme.palette.maskColor.second,
        marginTop: theme.spacing(4),
        boxSizing: 'border-box',
    },
    input: {
        boxSizing: 'border-box',
    },
    button: {
        marginTop: theme.spacing(2),
    },
    closeButton: {
        position: 'absolute',
        top: theme.spacing(2),
        right: theme.spacing(2),
        color: theme.palette.maskColor.main,
    },
}))

export interface RenameDialogProps extends Omit<InjectedDialogProps, 'title' | 'onSubmit'> {
    title?: string
    currentName: string
    message?: ReactNode | string
    description?: ReactNode | string
    onSubmit(name: string): void
    onClose(): void
}

export const RenameDialog = memo(
    ({ title, message, description, currentName, onSubmit, onClose, ...rest }: RenameDialogProps) => {
        const { classes } = useStyles()
        const t = useFileServiceTrans()
        const [name, setName] = useState(currentName)
        const isDirty = name !== currentName
        const isValid = isDirty && name.length >= 3 && name.length <= 20

        return (
            <InjectedDialog classes={{ paper: classes.paper, ...rest.classes }} {...rest}>
                <DialogContent className={classes.content}>
                    <Typography variant="h1" className={classes.title}>
                        {t.rename()}
                    </Typography>
                    <Typography component="div" className={classes.message}>
                        {message}
                    </Typography>
                    <div className={classes.inputBox}>
                        <InputBase
                            fullWidth
                            autoFocus
                            className={classes.input}
                            value={name}
                            onChange={(event) => setName(event.currentTarget.value)}
                        />
                    </div>
                    <Button
                        className={classes.button}
                        fullWidth
                        color="primary"
                        disabled={!isValid}
                        onClick={() => onSubmit(name)}>
                        {t.confirm()}
                    </Button>
                    <Icons.Close className={classes.closeButton} size={24} onClick={() => onClose()} />
                </DialogContent>
            </InjectedDialog>
        )
    },
)
