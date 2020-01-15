import React, { useRef, useState } from 'react'
import {
    makeStyles,
    withMobileDialog,
    Dialog,
    DialogTitle,
    IconButton,
    Button,
    DialogActions,
    DialogContent,
    Typography,
    FormControl,
    Input,
    Box,
    TextField,
    createStyles,
    InputLabel,
    Select,
    MenuItem,
} from '@material-ui/core'
import { useStylesExtends } from '../custom-ui-helper'
import { geti18nString } from '../../utils/i18n'
import { DialogDismissIconUI } from './DialogDismissIcon'
import BackupRestoreTab from '../../extension/options-page/DashboardComponents/BackupRestoreTab'
import { RedPacket } from '../../extension/options-page/DashboardComponents/RedPacket'

interface RedPacketDialogProps
    extends withClasses<
        | KeysInferFromUseStyles<typeof useStyles>
        | 'dialog'
        | 'backdrop'
        | 'container'
        | 'paper'
        | 'input'
        | 'header'
        | 'content'
        | 'actions'
        | 'close'
        | 'button'
        | 'label'
        | 'switch'
    > {
    open: boolean
    onConfirm: () => void
    onDecline: () => void
}

const useNewPacketStyles = makeStyles(theme =>
    createStyles({
        line: {
            display: 'flex',
            margin: theme.spacing(1),
        },
        input: {
            flex: 1,
            padding: theme.spacing(1),
        },
    }),
)

function NewPacket(props: RedPacketDialogProps) {
    const classes = useStylesExtends(useNewPacketStyles(), props)
    return (
        <div>
            <div className={classes.line}>
                <FormControl variant="filled" className={classes.input}>
                    <InputLabel>Token</InputLabel>
                    <Select value={10}>
                        <MenuItem key={10} value={10}>
                            USDT
                        </MenuItem>
                        <MenuItem key={20} value={20}>
                            SDTU
                        </MenuItem>
                    </Select>
                </FormControl>
                <FormControl variant="filled" className={classes.input}>
                    <InputLabel>Split Mode</InputLabel>
                    <Select value={10}>
                        <MenuItem key={10} value={10}>
                            Average
                        </MenuItem>
                        <MenuItem key={20} value={20}>
                            Random
                        </MenuItem>
                    </Select>
                </FormControl>
            </div>
            <div className={classes.line}>
                <TextField className={classes.input} label="Amount per Share" variant="filled" defaultValue="0.5" />
                <TextField className={classes.input} label="Shares" variant="filled" defaultValue="5" />
            </div>
            <div className={classes.line}>
                <TextField
                    className={classes.input}
                    label="Attached Message"
                    variant="filled"
                    defaultValue="Best Wishes!"
                />
            </div>
            <div className={classes.line}>
                <Typography variant="body2">
                    Balance: 2.5 USDT (with 0.01 ETH) <br />
                    Notice: A small gas fee will occur for publishing.
                </Typography>
                <Button
                    className={classes.button}
                    style={{ marginLeft: 'auto', width: 140 }}
                    color="primary"
                    variant="contained"
                    onClick={props.onConfirm}>
                    Send 2.5 USDT
                </Button>
            </div>
        </div>
    )
}

const useExistingPacketStyles = makeStyles(theme =>
    createStyles({
        wrapper: {
            display: 'flex',
            width: 400,
            flexDirection: 'column',
            overflow: 'auto',
            margin: `${theme.spacing(1)}px auto`,
        },
        hint: {
            padding: theme.spacing(0.5, 1),
            border: `1px solid ${theme.palette.background.default}`,
            borderRadius: theme.spacing(1),
            textAlign: 'center',
        },
    }),
)

function ExistingPacket(props: RedPacketDialogProps) {
    const classes = useStylesExtends(useExistingPacketStyles(), props)
    return (
        <div className={classes.wrapper}>
            <Typography component="div" color="primary" className={classes.hint}>
                Remove Red Packet from this post
            </Typography>
            <RedPacket />
            <RedPacket />
            <RedPacket />
        </div>
    )
}

const useStyles = makeStyles({
    MUIInputRoot: {
        minHeight: 108,
        flexDirection: 'column',
        padding: 10,
        boxSizing: 'border-box',
    },
    MUIInputInput: {
        fontSize: 18,
        minHeight: '8em',
    },
    title: {
        marginLeft: 6,
    },
    actions: {
        paddingLeft: 26,
    },
    container: {
        width: '100%',
    },
})
const ResponsiveDialog = withMobileDialog({ breakpoint: 'xs' })(Dialog)

export default function RedPacketDialog(props: RedPacketDialogProps) {
    const classes = useStylesExtends(useStyles(), props)
    const rootRef = useRef<HTMLDivElement>(null)

    const tabs = [
        {
            label: 'Create New',
            component: <NewPacket {...props} />,
        },
        {
            label: 'Select Existing',
            component: <ExistingPacket {...props} />,
        },
    ]
    const currentTab = useState(0)

    return (
        <div ref={rootRef}>
            <ResponsiveDialog
                className={classes.dialog}
                classes={{
                    container: classes.container,
                    paper: classes.paper,
                }}
                open={props.open}
                scroll="paper"
                fullWidth
                maxWidth="sm"
                container={() => rootRef.current}
                disablePortal
                disableAutoFocus
                disableEnforceFocus
                BackdropProps={{
                    className: classes.backdrop,
                }}>
                <DialogTitle className={classes.header}>
                    <IconButton classes={{ root: classes.close }} onClick={props.onDecline}>
                        <DialogDismissIconUI />
                    </IconButton>
                    <Typography className={classes.title} display="inline" variant="inherit">
                        Plugin: Red Packet
                    </Typography>
                </DialogTitle>
                <DialogContent className={classes.content}>
                    <BackupRestoreTab height={292} state={currentTab} tabs={tabs}></BackupRestoreTab>
                </DialogContent>
            </ResponsiveDialog>
        </div>
    )
}
