import React from 'react'
import {
    makeStyles,
    createStyles,
    Paper,
    Typography,
    TextField,
    Theme,
    ThemeProvider,
    InputAdornment,
    LinearProgress,
    useTheme,
} from '@material-ui/core'
import classNames from 'classnames'
import AlternateEmailIcon from '@material-ui/icons/AlternateEmail'
import CloseIcon from '@material-ui/icons/Close'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import ShowcaseBox from '../../../extension/options-page/DashboardComponents/ShowcaseBox'
import { merge, cloneDeep } from 'lodash-es'
import { green, orange } from '@material-ui/core/colors'

export enum ImmersiveGuideStep {
    FindUsername = 'find-username',
    PasteIntoBio = 'paste-into-bio',
}

const CurrentStep = (step: ImmersiveGuideStep) => {
    switch (step) {
        case ImmersiveGuideStep.FindUsername:
            return <FindUsername></FindUsername>
        case ImmersiveGuideStep.PasteIntoBio:
            return <PasteIntoBio></PasteIntoBio>
    }
}

const wizardTheme = (theme: Theme): Theme =>
    merge(cloneDeep(theme), {
        palette: {
            secondary: {
                contrastText: '#fff',
                light: orange[300],
                main: orange[500],
                dark: orange[700],
            },
        },
        overrides: {
            MuiOutlinedInput: {
                input: {
                    paddingTop: 14.5,
                    paddingBottom: 14.5,
                },
                multiline: {
                    paddingTop: 14.5,
                    paddingBottom: 14.5,
                },
                notchedOutline: {
                    borderColor: '#EAEAEA',
                },
            },
            MuiInputLabel: {
                outlined: {
                    transform: 'translate(14px, 16px) scale(1)',
                },
            },
            MuiTextField: {
                root: {
                    marginTop: theme.spacing(2),
                    marginBottom: 0,

                    '&:first-child': {
                        marginTop: 0,
                    },
                },
            },
            MuiButton: {
                root: {
                    '&[hidden]': {
                        visibility: 'hidden',
                    },
                },
                text: {
                    height: 28,
                    lineHeight: 1,
                    paddingTop: 0,
                    paddingBottom: 0,
                },
            },
        },
        props: {
            MuiButton: {
                size: 'medium',
            },
            MuiTextField: {
                fullWidth: true,
                variant: 'outlined',
                margin: 'normal',
            },
        },
    })

//#region wizard dialog
const useWizardDialogStyles = makeStyles((theme) =>
    createStyles<string, { completion: number }>({
        root: {
            boxSizing: 'border-box',
            padding: '50px 36px 40px',
            position: 'relative',
            width: 440,
            height: 440,
            borderRadius: 12,
            boxShadow:
                theme.palette.type === 'dark'
                    ? 'none'
                    : '0px 2px 4px rgba(96, 97, 112, 0.16), 0px 0px 1px rgba(40, 41, 61, 0.04)',
            border: `${theme.palette.type === 'dark' ? 'solid' : 'none'} 1px ${theme.palette.divider}`,
            overflow: 'hidden',
        },
        close: {
            color: theme.palette.text.primary,
            position: 'absolute',
            right: 10,
            top: 10,
        },
        primary: {
            fontSize: 30,
            fontWeight: 500,
            lineHeight: '37px',
        },
        secondary: {
            fontSize: 14,
            fontWeight: 500,
            lineHeight: 1.75,
            marginTop: 2,
        },
        sandbox: {
            marginTop: 16,
        },
        tip: {
            fontSize: 16,
            lineHeight: 1.75,
        },
        button: {
            width: 200,
            height: 40,
            marginBottom: 14,
        },
        header: {
            marginBottom: 24,
        },
        content: {},
        footer: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            marginTop: 36,
        },
        progress: {
            color: (props) => (props.completion === 100 ? theme.palette.success.main : theme.palette.warning.main),
            left: 0,
            right: 0,
            bottom: 0,
            height: 8,
            position: 'absolute',
        },
    }),
)

interface WizardDialogProps {
    title: string
    completion: number
    optional?: boolean
    content?: React.ReactNode
    footer?: React.ReactNode
    onClose?: () => void
}

function WizardDialog(props: WizardDialogProps) {
    const { title, optional = false, completion, content, footer, onClose } = props
    const classes = useWizardDialogStyles(props)
    const theme = useTheme()

    theme.palette.secondary.main = orange[500]

    return (
        <ThemeProvider theme={wizardTheme}>
            <Paper id="draggable_handle" className={classes.root}>
                <header className={classes.header}>
                    <Typography className={classes.primary} color="textPrimary" variant="h1">
                        {title}
                    </Typography>
                    {optional ? (
                        <Typography className={classes.secondary} color="textSecondary" variant="body2">
                            [Optional]
                        </Typography>
                    ) : null}
                </header>
                <main className={classes.content}>{content}</main>
                <footer className={classes.footer}>{footer}</footer>
                <LinearProgress
                    className={classes.progress}
                    variant="determinate"
                    color="secondary"
                    value={completion}></LinearProgress>
                <CloseIcon className={classes.close} cursor="pointer"></CloseIcon>
            </Paper>
        </ThemeProvider>
    )
}
//#endregion

//#region find username
const useFindUsernameStyles = makeStyles((theme) =>
    createStyles({
        input: {
            marginTop: '50px !important',
            marginBottom: 24,
        },
        inputFocus: {
            '& svg': {
                color: theme.palette.primary.main,
            },
        },
        icon: {
            color: theme.palette.text.secondary,
        },
        tip: {},
    }),
)

interface FindUsernameProps {}

function FindUsername(props: FindUsernameProps) {
    const classes = useWizardDialogStyles({ completion: 50 })
    const findUsernameClasses = useFindUsernameStyles()
    return (
        <WizardDialog
            completion={50}
            title="Find your username"
            content={
                <form>
                    <TextField
                        className={findUsernameClasses.input}
                        variant="outlined"
                        label="Username"
                        InputProps={{
                            classes: {
                                focused: findUsernameClasses.inputFocus,
                            },
                            startAdornment: (
                                <InputAdornment position="start">
                                    <AlternateEmailIcon className={findUsernameClasses.icon} />
                                </InputAdornment>
                            ),
                        }}></TextField>
                    <Typography className={classNames(classes.tip, findUsernameClasses.tip)} variant="body2">
                        Maskbook needs the username to connect your Profile to your Persona.
                        <br /> Make sure it is correct.
                    </Typography>
                </form>
            }
            footer={
                <ActionButton className={classes.button} variant="contained" color="primary">
                    Next
                </ActionButton>
            }></WizardDialog>
    )
}
//#endregion

//#region paste into bio
const usePasteIntoBioStyles = makeStyles((theme) =>
    createStyles({
        input: {
            marginTop: '50px !important',
            marginBottom: 24,
        },
        tip: {
            marginBottom: 16,
        },
    }),
)

interface PasteIntoBioProps {}

function PasteIntoBio(props: PasteIntoBioProps) {
    const classes = useWizardDialogStyles({ completion: 100 })
    const pasteIntoBioClasses = usePasteIntoBioStyles()
    return (
        <WizardDialog
            completion={100}
            title="Paste it in your bio"
            optional
            content={
                <form>
                    <Typography className={classNames(classes.tip, pasteIntoBioClasses.tip)} variant="body2">
                        Add the text above in your bio to access advanced features. Please don't delete or change it.
                    </Typography>
                    <ShowcaseBox>asdfsadfasfsfskjdfkjdsfkjasdfasdfsadfasfsfskjdfkjdsfkjasdf</ShowcaseBox>
                </form>
            }
            footer={
                <>
                    <ActionButton className={classes.button} variant="contained" color="primary">
                        Please add it for me
                    </ActionButton>
                    <ActionButton className={classes.button} variant="contained" color="secondary">
                        Done
                    </ActionButton>
                    <ActionButton variant="text">Finish</ActionButton>
                </>
            }></WizardDialog>
    )
}
//#endregion

//#region setup guide
export interface SetupGuideProps {}

export function SetupGuide(props: SetupGuideProps) {
    return CurrentStep(ImmersiveGuideStep.FindUsername)
}
//#endregion
