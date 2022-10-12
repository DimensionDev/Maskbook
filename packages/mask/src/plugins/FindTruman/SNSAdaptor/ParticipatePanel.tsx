import { useAccount } from '@masknet/web3-hooks-base'
import { makeStyles, MaskTabList, useTabs } from '@masknet/theme'
import { useAsyncRetry } from 'react-use'
import {
    fetchQuestions,
    fetchUserStoryStatus,
    submitCompletion,
    submitPoll,
    submitPuzzle,
} from '../Worker/apis/index.js'
import { Box, Button, Card, DialogActions, DialogContent, Tab, Typography } from '@mui/material'
import { TabContext, TabPanel } from '@mui/lab'
import StageCard from './StageCard.js'
import { useControlledDialog } from '../../../utils/index.js'
import { InjectedDialog, Image } from '@masknet/shared'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import OptionsCard from './OptionsCard.js'
import ResultCard from './ResultCard.js'
import getUnixTime from 'date-fns/getUnixTime'
import {
    BasicQuestion,
    CompletionQuestionAnswer,
    PostType,
    QuestionGroup,
    UserCompletionStatus,
    UserPollOrPuzzleStatus,
} from '../types.js'
import { FindTrumanContext } from '../context.js'
import CompletionCard from './CompletionCard.js'

const useStyles = makeStyles()((theme, props) => ({
    panel: {},
    cover: {
        width: '100%',
        objectFit: 'cover',
        marginBottom: theme.spacing(2),
        borderRadius: '8px',
    },
    buttons: {
        padding: theme.spacing(2),
    },
    wrapper: {
        '&:not(:last-child)': {
            marginBottom: theme.spacing(2),
        },
    },
    tabPane: {
        width: 535,
        margin: '0 auto',
        padding: 0,
    },
    dialogWrapper: {
        paddingBottom: theme.spacing(2),
        '::-webkit-scrollbar': {
            backgroundColor: 'transparent',
            width: 20,
        },
        '::-webkit-scrollbar-thumb': {
            borderRadius: '20px',
            width: 5,
            border: '7px solid rgba(0, 0, 0, 0)',
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(250, 250, 250, 0.2)' : 'rgba(0, 0, 0, 0.2)',
            backgroundClip: 'padding-box',
        },
    },
}))

interface ParticipatePanelProps {
    storyId?: string
}

export default function ParticipatePanel(props: ParticipatePanelProps) {
    const { storyId } = props
    const { classes } = useStyles()
    const { t } = useContext(FindTrumanContext)
    const account = useAccount()

    const { open: isDialogOpen, onOpen: onDialogOpen, onClose: onDialogClose } = useControlledDialog()

    const { value: userStoryStatus, retry: onUpdate } = useAsyncRetry(async () => {
        return account && storyId ? fetchUserStoryStatus(storyId, account) : undefined
    }, [account, storyId])

    return (
        <div className={classes.panel}>
            {userStoryStatus && (
                <>
                    <Image className={classes.cover} src={userStoryStatus.img} />
                    <StageCard userStoryStatus={userStoryStatus} />
                    <DialogActions className={classes.buttons}>
                        <Button
                            fullWidth
                            color="primary"
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
        <TabContext value={currentTab}>
            <InjectedDialog
                title={t('plugin_find_truman_dialog_participation_title')}
                open={open}
                onClose={onClose}
                titleTabs={
                    <MaskTabList variant="base" onChange={onChange} aria-label="ParticipateDialogTabs">
                        <Tab label={t('plugin_find_truman_dialog_critical')} value={ParticipationType.Critical} />
                        <Tab label={t('plugin_find_truman_dialog_noncritical')} value={ParticipationType.NonCritical} />
                    </MaskTabList>
                }>
                <DialogContent className={classes.dialogWrapper}>
                    <Box>
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
                </DialogContent>
            </InjectedDialog>
        </TabContext>
    )
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
