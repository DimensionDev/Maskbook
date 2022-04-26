import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAsyncRetry } from 'react-use'
import { makeStyles, useStylesExtends, useTabs } from '@masknet/theme'
import { fetchQuestions, fetchUserStoryStatus, submitCompletion, submitPoll, submitPuzzle } from '../Worker/apis'
import { Box, Button, Card, DialogActions, DialogContent, Typography } from '@mui/material'
import { TabContext, TabPanel } from '@mui/lab'
import StageCard from './StageCard'
import { useControlledDialog } from '../../../utils'
import { InjectedDialog } from '@masknet/shared'
import { useAccount } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import OptionsCard from './OptionsCard'
import ResultCard from './ResultCard'
import getUnixTime from 'date-fns/getUnixTime'
import {
    BasicQuestion,
    CompletionQuestionAnswer,
    PostType,
    QuestionGroup,
    UserCompletionStatus,
    UserPollOrPuzzleStatus,
} from '../types'
import { FindTrumanContext } from '../context'
import AbstractTab, { AbstractTabProps } from '../../../components/shared/AbstractTab'
import { useTabsStyles } from './FindTrumanDialog'
import CompletionCard from './CompletionCard'

const useStyles = makeStyles()((theme, props) => ({
    panel: {},
    cover: {
        width: '100%',
        objectFit: 'cover',
        marginBottom: theme.spacing(2),
        borderRadius: '8px',
    },
    title: {
        marginBottom: theme.spacing(2),
    },
    buttons: {
        padding: theme.spacing(2),
    },
    wrapper: {
        '&:not(:last-child)': {
            marginBottom: theme.spacing(2),
        },
    },
    abstractTabWrapper: {
        position: 'sticky',
        top: 0,
        width: '100%',
        zIndex: 2,
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(2),
        backgroundColor: theme.palette.background.paper,
    },
    tabPaneWrapper: {
        width: '100%',
        marginBottom: '24px',
    },
    tabPane: {
        width: 535,
        margin: '0 auto',
        padding: 0,
    },
    dialogWrapper: {
        paddingBottom: '0px !important',
        paddingTop: '0px !important',
    },
}))

interface ParticipatePanelProps {
    storyId?: string
}

export default function ParticipatePanel(props: ParticipatePanelProps) {
    const { storyId } = props
    const { classes } = useStyles()
    const { t } = useContext(FindTrumanContext)
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)

    const { open: isDialogOpen, onOpen: onDialogOpen, onClose: onDialogClose } = useControlledDialog()

    const { value: userStoryStatus, retry: onUpdate } = useAsyncRetry(async () => {
        return account && storyId ? fetchUserStoryStatus(storyId, account) : undefined
    }, [account, storyId])

    return (
        <div className={classes.panel}>
            {userStoryStatus && (
                <>
                    <img className={classes.cover} src={userStoryStatus.img} />
                    <StageCard userStoryStatus={userStoryStatus} />
                    <DialogActions className={classes.buttons}>
                        <Button
                            fullWidth
                            color="primary"
                            variant="contained"
                            onClick={() => {
                                onDialogOpen()
                            }}>
                            {t('plugin_find_truman_dialog_view_all')}
                        </Button>
                    </DialogActions>
                </>
            )}
            <ParticipateDialog account={account} open={isDialogOpen} onClose={onDialogClose} onUpdate={onUpdate} />
        </div>
    )
}

enum ParticipationType {
    Critical = 'critical',
    NonCritical = 'non-critical',
}

const ParticipationTabValues = [ParticipationType.Critical, ParticipationType.NonCritical]

interface ParticipateDialogProps {
    account: string
    open: boolean
    onClose: () => void
    onUpdate: () => void
}

function ParticipateDialog(props: ParticipateDialogProps) {
    const { account, open, onClose, onUpdate } = props
    const { classes } = useStyles()
    const { t } = useContext(FindTrumanContext)

    const [currentTab, onChange, tabs] = useTabs(ParticipationType.Critical, ParticipationType.NonCritical)

    const [questions, setQuestions] = useState<QuestionGroup>()

    const updateQuestions = useCallback(async () => {
        if (!account) return
        const questions = await fetchQuestions(account)
        questions.fills = questions.fills.map((f) => {
            return { ...f, type: PostType.Completion }
        })
        questions.polls = questions.polls.map((f) => {
            return { ...f, type: PostType.Poll }
        })
        questions.puzzles = questions.puzzles.map((f) => {
            return { ...f, type: PostType.Puzzle }
        })
        setQuestions(questions)
    }, [account, open])

    useEffect(() => {
        updateQuestions()
    }, [account, open])

    const handleSubmitPoll = async (postType: PostType, pollId: string, choice: number) => {
        const target = pollId
        const from = account
        const timestamp = getUnixTime(Date.now())
        if (postType === PostType.Puzzle) {
            await submitPuzzle(account, { target, from, timestamp, choice })
        } else if (postType === PostType.Poll) {
            await submitPoll(account, { target, from, timestamp, choice })
        }
        await updateQuestions()
        onUpdate()
    }

    const handleSubmitCompletion = async (quesId: string, answers: CompletionQuestionAnswer[]) => {
        const timestamp = getUnixTime(Date.now())
        await submitCompletion(account, {
            quesId,
            answers,
            timestamp,
        })
        await updateQuestions()
        onUpdate()
    }

    const renderItem = (question: BasicQuestion) => {
        if (question.type === PostType.Completion) {
            return (
                <Card key={`${question.type}_${question.id}`} variant="outlined" className={classes.wrapper}>
                    <CompletionCard
                        onSubmit={handleSubmitCompletion}
                        completionStatus={question as UserCompletionStatus}
                    />
                </Card>
            )
        } else {
            const poll = question as UserPollOrPuzzleStatus
            return poll.status ? (
                <Card key={`${poll.type}_${poll.id}`} variant="outlined" className={classes.wrapper}>
                    <OptionsCard
                        userStatus={poll}
                        onSubmit={async (choice) => {
                            return handleSubmitPoll(poll.type, poll.id, choice)
                        }}
                    />
                </Card>
            ) : (
                <Card key={`${poll.type}_${poll.id}`} variant="outlined" className={classes.wrapper}>
                    <ResultCard
                        type={poll.type}
                        userStatus={poll}
                        result={{
                            ...poll,
                            correct: poll.result,
                            count: poll.count || [],
                        }}
                    />
                </Card>
            )
        }
    }

    const itemsCritical = useMemo(
        () =>
            [
                ...(questions?.fills || []).filter((d) => d.critical),
                ...(questions?.polls || []).filter((d) => d.critical),
                ...(questions?.puzzles || []).filter((d) => d.critical),
            ].sort((a, b) => b.order - a.order),
        [questions],
    )
    const itemsNonCritical = useMemo(
        () =>
            [
                ...(questions?.fills || []).filter((d) => !d.critical),
                ...(questions?.polls || []).filter((d) => !d.critical),
                ...(questions?.puzzles || []).filter((d) => !d.critical),
            ].sort((a, b) => b.order - a.order),
        [questions],
    )

    return (
        <InjectedDialog title={t('plugin_find_truman_dialog_participation_title')} open={open} onClose={onClose}>
            <DialogContent className={classes.dialogWrapper}>
                <TabContext value={currentTab}>
                    <div className={classes.abstractTabWrapper}>
                        <FindTrumanDialogTabs currentTab={currentTab} setTab={(tab) => onChange(null, tab)} />
                    </div>
                    <Box className={classes.tabPaneWrapper}>
                        <TabPanel
                            className={classes.tabPane}
                            value={ParticipationType.Critical}
                            sx={{ height: '522px' }}>
                            {!itemsCritical.length ? <EmptyTip /> : itemsCritical.map((e) => renderItem(e))}
                        </TabPanel>
                        <TabPanel
                            className={classes.tabPane}
                            value={ParticipationType.NonCritical}
                            sx={{ height: '522px' }}>
                            {!itemsNonCritical.length ? <EmptyTip /> : itemsNonCritical.map((e) => renderItem(e))}
                        </TabPanel>
                    </Box>
                </TabContext>
            </DialogContent>
        </InjectedDialog>
    )
}

interface ParticipationTabsProps
    extends withClasses<'tab' | 'tabs' | 'tabPanel' | 'indicator' | 'focusTab' | 'tabPaper'> {
    currentTab: ParticipationType
    setTab(tab: ParticipationType): void
}

function FindTrumanDialogTabs(props: ParticipationTabsProps) {
    const classes = useStylesExtends(useTabsStyles({ columns: 'repeat(2, 50%)' }), props)
    const { t } = useContext(FindTrumanContext)
    const { currentTab, setTab } = props

    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: <span>{t('plugin_find_truman_dialog_critical')}</span>,
                sx: { p: 0 },
                cb: () => setTab(ParticipationType.Critical),
            },
            {
                label: <span>{t('plugin_find_truman_dialog_noncritical')}</span>,
                sx: { p: 0 },
                cb: () => setTab(ParticipationType.NonCritical),
            },
        ],
        index: ParticipationTabValues.indexOf(currentTab),
        classes,
        hasOnlyOneChild: true,
    }

    return <AbstractTab {...tabProps} />
}

function EmptyTip() {
    const { t } = useContext(FindTrumanContext)
    return (
        <Box display="flex" height="100%" alignItems="center">
            <Typography margin="auto" textAlign="center" variant="h6" color="textSecondary">
                {t('plugin_find_truman_coming_soon')}
            </Typography>
        </Box>
    )
}
