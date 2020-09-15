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
import Services from '../../../extension/service'
import { getActivatedUI } from '../../../social-network/ui'
import { useCurrentIdentity } from '../../../components/DataSource/useActivatedUI'
import type { PollGunDB } from '../Services'
import { PollCardUI } from './Polls'
import type { PollMetaData } from '../types'

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
            position: 'absolute',
            left: '50%',
            top: '50%',
        },
        whiteColor: {
            color: '#fff',
        },
    }),
)

interface NewPollProps {
    loading: [boolean, React.Dispatch<React.SetStateAction<boolean>>]
    senderName: string | undefined
    senderFingerprint: string | undefined
    switchToCreateNewPoll: () => void
}

function NewPollUI(props: PollsDialogProps & NewPollProps) {
    const classes = useStylesExtends(useNewPollStyles(), props)
    const [loading, setLoading] = props.loading
    const [question, setQuestion] = useState('')

    const [options, setOptions] = useState<Array<string>>(['', ''])

    const [days, setDays] = useState(1)
    const [hours, setHours] = useState(0)
    const [minutes, setMinutes] = useState(0)

    const handleOptionsInput = (index: number, value: string) => {
        setOptions(options.map((option, i) => (i === index ? value : option)))
    }

    const addNewOption = () => {
        setOptions(options.concat(['']))
    }

    const sendPoll = async () => {
        const start_time = new Date()
        const end_time = new Date(
            start_time.getTime() + days * 24 * 60 * 60 * 1000 + hours * 60 * 60 * 1000 + minutes * 60 * 1000,
        )
        setLoading(true)
        Services.Plugin.invokePlugin('maskbook.polls', 'createNewPoll', {
            question,
            options,
            start_time,
            end_time,
            sender: props.senderName,
            id: props.senderFingerprint,
        }).then((res) => {
            setLoading(false)
            props.switchToCreateNewPoll()
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
                <TextField
                    label="Ask a question..."
                    variant="filled"
                    onChange={(e) => {
                        setQuestion((e.target as HTMLInputElement)?.value)
                    }}
                />
            </FormControl>
            <div className={classes.pollWrap}>
                <div className={classes.optionsWrap}>
                    {options.map((option, index) => (
                        <FormControl className={classes.line} key={index}>
                            <TextField
                                label={`choice${index + 1}`}
                                variant="filled"
                                onChange={(e) => {
                                    handleOptionsInput(index, (e.target as HTMLInputElement)?.value)
                                }}
                            />
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
                    startIcon={loading ? <CircularProgress classes={{ root: classes.whiteColor }} size={24} /> : null}
                    style={{ color: '#fff' }}
                    onClick={sendPoll}>
                    Send Poll
                </Button>
            </div>
        </>
    )
}

interface ExistingPollsProps {
    onSelectExistingPoll(poll?: PollMetaData | null): void
    senderFingerprint: string | undefined
}

function ExistingPollsUI(props: PollsDialogProps & ExistingPollsProps) {
    const [polls, setPolls] = useState<Array<PollGunDB>>([])
    const [loading, setLoading] = useState(false)
    const classes = useStylesExtends(useNewPollStyles(), props)

    useEffect(() => {
        setLoading(true)
        Services.Plugin.invokePlugin('maskbook.polls', 'getAllExistingPolls').then((polls) => {
            setLoading(false)
            const myPolls: Array<PollGunDB> = []
            polls.map((poll) => {
                if (poll.id === props.senderFingerprint) {
                    myPolls.push(poll)
                }
            })
            setPolls(polls.reverse())
        })
    }, [props.senderFingerprint])

    const insertPoll = (poll?: PollMetaData | null) => {
        props.onSelectExistingPoll(poll)
    }

    return (
        <div className={classes.wrapper}>
            {loading ? (
                <CircularProgress size={35} classes={{ root: classes.loading }} />
            ) : (
                polls.map((p) => <PollCardUI onClick={() => insertPoll(p)} poll={p} key={p.key as string} />)
            )}
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

    const insertPoll = (data?: PollMetaData | null) => {
        const ref = getActivatedUI().typedMessageMetadata
        const next = new Map(ref.value)
        data ? next.set('com.maskbook.poll:1', data) : next.delete('com.maskbook.poll:1')
        ref.value = next
        props.onConfirm()
    }

    const senderName = useCurrentIdentity()?.linkedPersona?.nickname
    const senderFingerprint = useCurrentIdentity()?.linkedPersona?.fingerprint

    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: 'Create New',
                children: (
                    <NewPollUI
                        {...props}
                        loading={loading}
                        switchToCreateNewPoll={createNewPoll}
                        senderName={senderName}
                        senderFingerprint={senderFingerprint}
                    />
                ),
                p: 0,
            },
            {
                label: 'Select Existing',
                children: (
                    <ExistingPollsUI
                        {...props}
                        onSelectExistingPoll={insertPoll}
                        senderFingerprint={senderFingerprint}
                    />
                ),
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
