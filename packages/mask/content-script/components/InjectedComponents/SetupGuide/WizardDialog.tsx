import { Box, IconButton, Paper, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { SetupGuideStep } from '@masknet/shared-base'
import { Icons } from '@masknet/icons'

interface ContentUIProps {
    dialogType: SetupGuideStep
    content?: React.ReactNode
    footer?: React.ReactNode
    tip?: React.ReactNode
    dismiss?: React.ReactNode
}

const useStyles = makeStyles()((theme) => ({
    content: {
        marginBottom: theme.spacing(2),
    },
    footer: {
        marginLeft: 0,
        marginTop: theme.spacing(3),
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
    },
}))

function ContentUI(props: ContentUIProps) {
    const { classes } = useStyles()
    switch (props.dialogType) {
        case SetupGuideStep.PinExtension:
            return (
                <Box>
                    <main className={classes.content}>{props.content}</main>
                    <div>{props.tip}</div>
                    {props.footer ?
                        <footer className={classes.footer}>{props.footer}</footer>
                    :   null}
                    {props.dismiss ?
                        <div>{props.dismiss}</div>
                    :   null}
                </Box>
            )
        default:
            return null
    }
}

const useWizardDialogStyles = makeStyles()((theme) => ({
    root: {
        padding: theme.spacing(3),
        position: 'relative',
        boxShadow: theme.palette.mode === 'dark' ? 'none' : theme.shadows[4],
        border: `${theme.palette.mode === 'dark' ? 'solid' : 'none'} 1px ${theme.palette.divider}`,
        borderRadius: 20,
        [theme.breakpoints.down('sm')]: {
            position: 'fixed',
            bottom: 0,
            left: 0,
            margin: 0,
            alignSelf: 'center',
            borderRadius: 0,
            boxShadow: 'none',
            border: `solid 1px ${theme.palette.divider}`,
            width: '100%',
        },
        userSelect: 'none',
        boxSizing: 'border-box',
        width: 480,
        '&.small': {
            width: 384,
        },
        overflow: 'hidden',
    },
    close: {
        color: theme.palette.text.primary,
        position: 'absolute',
        right: 10,
        top: 10,
        cursor: 'pointer',
    },
    header: {
        height: 40,
    },
    content: {},
    footer: {},
}))

interface WizardDialogProps {
    small?: boolean
    title?: string
    dialogType: SetupGuideStep
    optional?: boolean
    content?: React.ReactNode
    tip?: React.ReactNode
    footer?: React.ReactNode
    dismiss?: React.ReactNode
    onClose?: () => void
}

export function WizardDialog(props: WizardDialogProps) {
    const { small, title, dialogType, content, tip, footer, dismiss, onClose } = props
    const { classes, cx } = useWizardDialogStyles()

    return (
        <Paper className={cx(classes.root, small ? 'small' : '')}>
            <header className={classes.header}>
                <Typography color="textPrimary" variant="h3" fontSize={24}>
                    {title}
                </Typography>
            </header>
            <ContentUI dialogType={dialogType} content={content} tip={tip} footer={footer} dismiss={dismiss} />
            {onClose ?
                <IconButton className={classes.close} size="medium" onClick={onClose}>
                    <Icons.Close />
                </IconButton>
            :   null}
        </Paper>
    )
}
