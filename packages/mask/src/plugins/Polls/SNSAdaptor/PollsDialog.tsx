import { useState, useEffect } from 'react'
import {
    DialogContent,
    Typography,
    IconButton,
    Button,
    InputLabel,
    TextField,
    FormControl,
    Select,
    MenuItem,
    Divider,
    CircularProgress,
} from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import AddIcon from '@mui/icons-material/Add'
import addDate from 'date-fns/add'
import { usePortalShadowRoot } from '@masknet/theme'
import { useI18N } from '../../../utils'
import AbstractTab, { AbstractTabProps } from '../../../components/shared/AbstractTab'
import { useCurrentIdentity } from '../../../components/DataSource/useActivatedUI'
import type { PollGunDB } from '../Services'
import { PollCardUI } from './Polls'
import type { PollMetaData } from '../types'
import { POLL_META_KEY_1 } from '../constants'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { PluginPollRPC } from '../messages'
import { useCompositionContext } from '@masknet/plugin-infra'

const useNewPollStyles = makeStyles()((theme) => ({
    menuPaper: {
        height: 200,
    },
    line: {
        display: 'flex',
        margin: theme.spacing(1),
    },
    item: {
        flex: 1,
        margin: theme.spacing(1),
    },
    pollWrap: {
        border: '1px solid #ccd6dd',
        borderRadius: '10px',
        margin: theme.spacing(1),
        padding: theme.spacing(1),
    },
    optionsWrap: {
        position: 'relative',
        '& >div': {
            width: '80%',
            margin: theme.spacing(2),
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
}))

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
    const [options, setOptions] = useState<string[]>(['', ''])

    const [days, setDays] = useState(1)
    const [hours, setHours] = useState(0)
    const [minutes, setMinutes] = useState(0)

    const { t } = useI18N()

    const handleOptionsInput = (index: number, value: string) => {
        setOptions(options.map((option, i) => (i === index ? value : option)))
    }

    const addNewOption = () => {
        setOptions(options.concat(['']))
    }

    const sendPoll = async () => {
        const start_time = new Date()
        const end_time = addDate(start_time, {
            days,
            hours,
            minutes,
        })
        setLoading(true)
        PluginPollRPC.createNewPoll({
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

    // react hooks are not bound with the function identity but hooks order
    const useSelect = (count: number, fn: (newVal: number) => void, defaultIndex = 0) => {
        const options = Array.from<string>({ length: count }).fill('')

        return usePortalShadowRoot((container) => (
            <Select
                variant="standard"
                MenuProps={{
                    container,
                    anchorOrigin: { horizontal: 'left', vertical: 'bottom' },
                    classes: { paper: classes.menuPaper },
                }}
                value={defaultIndex}
                onChange={(e) => fn(e.target.value as number)}>
                {options.map((item, index) => (
                    <MenuItem value={index} key={index}>
                        {index}
                    </MenuItem>
                ))}
            </Select>
        ))
    }

    return (
        <>
            <FormControl variant="standard" className={classes.line}>
                <TextField
                    label={t('plugin_poll_question_hint')}
                    variant="filled"
                    onChange={(e) => {
                        setQuestion((e.target as HTMLInputElement)?.value)
                    }}
                />
            </FormControl>
            <div className={classes.pollWrap}>
                <div className={classes.optionsWrap}>
                    {options.map((option, index) => (
                        <FormControl variant="standard" className={classes.line} key={index}>
                            <TextField
                                label={`${t('plugin_poll_options_hint')}${index + 1}`}
                                variant="filled"
                                onChange={(e) => {
                                    handleOptionsInput(index, (e.target as HTMLInputElement)?.value)
                                }}
                            />
                        </FormControl>
                    ))}
                    <IconButton size="large" onClick={addNewOption} classes={{ root: classes.addButton }}>
                        <AddIcon color="primary" />
                    </IconButton>
                </div>
                <Divider light />
                <Typography variant="h6" className={classes.line}>
                    {t('plugin_poll_length')}
                </Typography>
                <div className={classes.line}>
                    <FormControl variant="filled" className={classes.item}>
                        <InputLabel>{t('plugin_poll_length_days')}</InputLabel>
                        {useSelect(8, setDays, days)}
                    </FormControl>
                    <FormControl variant="filled" className={classes.item}>
                        <InputLabel>{t('plugin_poll_length_hours')}</InputLabel>
                        {useSelect(25, setHours, hours)}
                    </FormControl>
                    <FormControl variant="filled" className={classes.item}>
                        <InputLabel>{t('plugin_poll_length_minutes')}</InputLabel>
                        {useSelect(61, setMinutes, minutes)}
                    </FormControl>
                </div>
            </div>
            <div className={classes.line} style={{ justifyContent: 'flex-end' }}>
                <Button
                    color="primary"
                    variant="contained"
                    startIcon={loading ? <CircularProgress classes={{ root: classes.whiteColor }} size={24} /> : null}
                    style={{ color: '#fff' }}
                    onClick={sendPoll}>
                    {t('plugin_poll_send_poll')}
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
    const [polls, setPolls] = useState<PollGunDB[]>([])
    const [loading, setLoading] = useState(false)
    const classes = useStylesExtends(useNewPollStyles(), props)

    useEffect(() => {
        setLoading(true)
        PluginPollRPC.getAllExistingPolls().then((polls) => {
            setLoading(false)
            const myPolls: PollGunDB[] = []
            polls.map((poll) => {
                if (poll.id === props.senderFingerprint) {
                    myPolls.push(poll)
                }
            })
            setPolls(myPolls.reverse())
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
interface PollsDialogProps extends withClasses<'wrapper'> {
    open: boolean
    onClose: () => void
}

export default function PollsDialog(props: PollsDialogProps) {
    const state = useState(0)
    const [, setTabState] = state
    const loading = useState(false)

    const { t } = useI18N()
    const { attachMetadata, dropMetadata } = useCompositionContext()

    const createNewPoll = () => {
        setTabState(1)
    }

    const insertPoll = (data?: PollMetaData | null) => {
        if (data) attachMetadata(POLL_META_KEY_1, data)
        else dropMetadata(POLL_META_KEY_1)
        props.onClose()
    }

    const senderName = useCurrentIdentity()?.linkedPersona?.nickname
    const senderFingerprint = useCurrentIdentity()?.linkedPersona?.fingerprint

    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: t('plugin_poll_create_new'),
                children: (
                    <NewPollUI
                        {...props}
                        loading={loading}
                        switchToCreateNewPoll={createNewPoll}
                        senderName={senderName}
                        senderFingerprint={senderFingerprint}
                    />
                ),
                sx: { p: 0 },
            },
            {
                label: t('plugin_poll_select_existing'),
                children: (
                    <ExistingPollsUI
                        {...props}
                        onSelectExistingPoll={insertPoll}
                        senderFingerprint={senderFingerprint}
                    />
                ),
                sx: { p: 0 },
            },
        ],
        state,
    }

    return (
        <InjectedDialog open={props.open} onClose={props.onClose} title={t('plugin_poll_display_name')}>
            <DialogContent>
                <AbstractTab height={450} {...tabProps} />
            </DialogContent>
        </InjectedDialog>
    )
}
