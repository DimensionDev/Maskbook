import { Box, IconButton, Paper, Typography } from '@mui/material'
import classNames from 'classnames'
import CloseIcon from '@mui/icons-material/Close'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { SetupGuideStep } from './types'

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
    tip: {},
}))

function ContentUI(props: ContentUIProps) {
    const { classes } = useStyles()
    switch (props.dialogType) {
        case SetupGuideStep.FindUsername:
        case SetupGuideStep.PinExtension:
            return (
                <Box>
                    <main className={classes.content}>{props.content}</main>
                    <div>{props.tip}</div>
                    {props.footer ? <footer className={classes.footer}>{props.footer}</footer> : null}
                    {props.dismiss ? <div>{props.dismiss}</div> : null}
                </Box>
            )
        default:
            return null
    }
}

export const useWizardDialogStyles = makeStyles()((theme) => ({
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
    button: {
        minWidth: 150,
        height: 40,
        minHeight: 40,
        marginLeft: 0,
        marginTop: 0,
        [theme.breakpoints.down('sm')]: {
            width: '100%',
        },
        fontSize: 14,
        wordBreak: 'keep-all',
        '&,&:hover': {
            color: `${MaskColorVar.twitterButtonText} !important`,
            background: `${MaskColorVar.twitterButton} !important`,
        },
    },
    close: {
        color: theme.palette.text.primary,
        position: 'absolute',
        right: 10,
        top: 10,
    },
    tip: {
        fontSize: 16,
        fontWeight: 500,
        lineHeight: '22px',
        paddingTop: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: 400,
        lineHeight: '22px',
    },
    header: {
        height: 40,
    },
    content: {},
    connection: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    connectItem: {
        flex: 1,
        height: 75,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    line: {
        width: 100,
        height: 1,
        borderTop: `dashed 1px  ${MaskColorVar.borderSecondary}`,
    },
    name: {
        fontSize: 16,
        fontWeight: 500,
    },
    footer: {},
}))

export interface WizardDialogProps {
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
    const { classes } = useWizardDialogStyles()

    return (
        <Paper className={classNames(classes.root, small ? 'small' : '')}>
            <header className={classes.header}>
                <Typography color="textPrimary" variant="h3" fontSize={24}>
                    {title}
                </Typography>
            </header>
            <ContentUI dialogType={dialogType} content={content} tip={tip} footer={footer} dismiss={dismiss} />
            {onClose ? (
                <IconButton className={classes.close} size="medium" onClick={onClose}>
                    <CloseIcon cursor="pointer" />
                </IconButton>
            ) : null}
        </Paper>
    )
}
