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
    CircularProgress,
} from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add'
import ShadowRootDialog from '../../../utils/shadow-root/ShadowRootDialog'
import { PortalShadowRoot } from '../../../utils/shadow-root/ShadowRootPortal'
import { DialogDismissIconUI } from '../../../components/InjectedComponents/DialogDismissIcon'
import { useStylesExtends, or } from '../../../components/custom-ui-helper'
import AbstractTab, { AbstractTabProps } from '../../../extension/options-page/DashboardComponents/AbstractTab'
import { useCapturedInput } from '../../../utils/hooks/useCapturedEvents'
import type { PollGunDB } from '../Services'
import { PollCardUI } from './Polls'
import Services from '../../../extension/service'

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
        loading: {
            color: '#fff',
        },
    }),
)

interface NewPollProps {
    loading: [boolean, React.Dispatch<React.SetStateAction<boolean>>]
    createNewPoll: () => void
}

function NewPollUI(props: PollsDialogProps & NewPollProps) {
    const classes = useStylesExtends(useNewPollStyles(), props)
    const [loading, setLoading] = props.loading
    const [question, setQuestion] = useState('')
    const [options, setOptions] = useState(new Array(2).fill(''))

    const addNewOption = () => {
        setOptions([...options, ''])
    }

    const sendPoll = async () => {
        const start_time = new Date()
        const end_time = new Date(
            start_time.getTime() + days * 24 * 60 * 60 * 1000 + hours * 60 * 60 * 1000 + minutes * 60 * 1000,
        )
        setLoading(true)
        Services.Plugin.invokePlugin('maskbook.polls', 'createNewPoll', {
            question,
            options: optionsInput,
            start_time,
            end_time,
        }).then((res) => {
            setLoading(false)
            props.createNewPoll()
        })
    }

    const renderSelect = (count: number, fn: (newVal: number) => void, defaultIndex = 0) => {
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
                <Button
                    className={classes.button}
                    color="primary"
                    variant="contained"
                    startIcon={loading ? <CircularProgress classes={{ root: classes.loading }} size={24} /> : null}
                    style={{ color: '#fff' }}
                    onClick={sendPoll}>
                    Send Poll
                </Button>
            </div>
        </>
    )
}

interface ExistingPollsProps {
    onSelectExistingPoll(): void
}

function ExistingPollsUI(props: PollsDialogProps & ExistingPollsProps) {
    const [polls, setPolls] = useState<Array<PollGunDB>>([])
    const classes = useStylesExtends(useNewPollStyles(), props)

    useEffect(() => {
        Services.Plugin.invokePlugin('maskbook.polls', 'getExistingPolls').then((data) => {
            console.log(data)
            setPolls(data.reverse() as Array<PollGunDB>)
        })
    }, [])

    const insertPoll = () => {
        props.onSelectExistingPoll()
        console.log('点击')
    }

    return (
        <div className={classes.wrapper}>
            {polls.map((p) => (
                <PollCardUI onClick={insertPoll} poll={p} key={p.key as string | number} />
            ))}
        </div>
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
    onConfirm: (opt?: any) => void
    onDecline: () => void
    DialogProps?: Partial<DialogProps>
}

export default function PollsDialog(props: PollsDialogProps) {
    const classes = useStylesExtends(useStyles(), props)
    const state = useState(0)
    const [, setTabState] = state
    const loading = useState(false)

    const createNewPoll = () => {
        setTabState(1)
    }

    const insertPoll = () => {
        props.onConfirm('111')
    }

    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: 'Create New',
                children: <NewPollUI {...props} loading={loading} createNewPoll={createNewPoll} />,
                p: 0,
            },
            {
                label: 'Select Existing',
                children: <ExistingPollsUI {...props} onSelectExistingPoll={insertPoll} />,
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
