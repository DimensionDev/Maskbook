import React, { useState } from 'react'
import {
    makeStyles,
    createStyles,
    DialogTitle,
    DialogContent,
    DialogProps,
    Typography,
    IconButton,
    Button,
    Input,
    InputLabel,
    FormControl,
    Select,
    MenuItem,
    Divider,
} from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add'
import ShadowRootDialog from '../../../utils/shadow-root/ShadowRootDialog'
import { PortalShadowRoot } from '../../../utils/shadow-root/ShadowRootPortal'
import { DialogDismissIconUI } from '../../../components/InjectedComponents/DialogDismissIcon'
import { useStylesExtends, or } from '../../../components/custom-ui-helper'
import AbstractTab, { AbstractTabProps } from '../../../extension/options-page/DashboardComponents/AbstractTab'
import { array } from 'yargs'

const useNewPollStyles = makeStyles((theme) =>
    createStyles({
        line: {
            display: 'flex',
            margin: theme.spacing(1),
        },
        item: {
            flex: 1,
            margin: theme.spacing(1),
        },
        input: {
            flex: 1,
            padding: theme.spacing(1),
            backgroundColor: '#F5F8FA',
        },
        inputLabel: {
            zIndex: 99,
        },
        pollWrap: {
            border: '1px solid #ccd6dd',
            borderRadius: '10px',
            margin: theme.spacing(1),
            padding: theme.spacing(1),
        },
        optionsWrap: {
            position: 'relative',
            '& div': {
                width: '90%',
            },
        },
        addButton: {
            position: 'absolute',
            bottom: '0',
            right: '10px',
        },
    }),
)

interface NewPollProps {}

function NewPollUI(props: PollsDialogProps & NewPollProps) {
    const classes = useStylesExtends(useNewPollStyles(), props)
    const [question, setQuestion] = useState('')
    const [options, setOptions] = useState(new Array(2).fill(''))

    const addNewOption = () => {
        setOptions([...options, ''])
    }

    const renderSelect = (count: number, defaultIndex?: number) => {
        const options = new Array(count).fill('')

        return (
            <Select
                MenuProps={{ container: props.DialogProps?.container ?? PortalShadowRoot }}
                value={defaultIndex || 0}>
                {options.map((item, index) => (
                    <MenuItem value={index}>{index}</MenuItem>
                ))}
            </Select>
        )
    }

    return (
        <>
            <FormControl className={classes.line}>
                <InputLabel className={classes.inputLabel}>Ask a question...</InputLabel>
                <Input className={classes.input}></Input>
            </FormControl>
            <div className={classes.pollWrap}>
                <div className={classes.optionsWrap}>
                    {options.map((option, index) => (
                        <FormControl className={classes.line}>
                            <InputLabel className={classes.inputLabel}>{`choice${index + 1}`}</InputLabel>
                            <Input className={classes.input}></Input>
                        </FormControl>
                    ))}
                    <IconButton onClick={addNewOption} classes={{ root: classes.addButton }}>
                        <AddIcon color="primary" />
                    </IconButton>
                </div>
                <Divider light />
                <Typography variant="h6" className={classes.line}>
                    Poll length
                </Typography>
                <div className={classes.line}>
                    <FormControl variant="filled" className={classes.item}>
                        <InputLabel>Days</InputLabel>
                        {renderSelect(8, 1)}
                    </FormControl>
                    <FormControl variant="filled" className={classes.item}>
                        <InputLabel>Hours</InputLabel>
                        {renderSelect(25)}
                    </FormControl>
                    <FormControl variant="filled" className={classes.item}>
                        <InputLabel>Minutes</InputLabel>
                        {renderSelect(61)}
                    </FormControl>
                </div>
            </div>
            <div className={classes.line} style={{ justifyContent: 'flex-end' }}>
                <Button className={classes.button} color="primary" variant="contained" style={{ color: '#fff' }}>
                    Send Poll
                </Button>
            </div>
        </>
    )
}

const useStyles = makeStyles((theme) => {
    createStyles({
        title: {
            marginLeft: 6,
        },
        container: {
            width: '100%',
        },
    })
})

interface PollsDialogProps
    extends withClasses<
        | KeysInferFromUseStyles<typeof useStyles>
        | 'dialog'
        | 'backdrop'
        | 'container'
        | 'close'
        | 'header'
        | 'content'
        | 'paper'
        | 'title'
        | 'label'
        | 'button'
    > {
    open: boolean
    onConfirm: () => void
    onDecline: () => void
    DialogProps?: Partial<DialogProps>
}

export default function PollsDialog(props: PollsDialogProps) {
    const classes = useStylesExtends(useStyles(), props)

    const state = useState(0)
    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: 'Create New',
                children: <NewPollUI {...props} />,
                p: 0,
            },
            {
                label: 'Select Existing',
                children: <div>Select Existing</div>,
                p: 0,
            },
        ],
        state,
    }

    return (
        <>
            <ShadowRootDialog
                className={classes.dialog}
                classes={{
                    container: classes.container,
                    paper: classes.paper,
                }}
                open={props.open}
                scroll="paper"
                fullWidth
                maxWidth="sm"
                disableAutoFocus
                disableEnforceFocus
                BackdropProps={{
                    className: classes.backdrop,
                }}
                {...props.DialogProps}>
                <DialogTitle className={classes.header}>
                    <IconButton classes={{ root: classes.close }} onClick={props.onDecline}>
                        <DialogDismissIconUI />
                    </IconButton>
                    <Typography className={classes.title} display="inline" variant="inherit">
                        Plugin: Polls
                    </Typography>
                </DialogTitle>
                <DialogContent className={classes.content}>
                    <AbstractTab height={450} {...tabProps}></AbstractTab>
                </DialogContent>
            </ShadowRootDialog>
        </>
    )
}
