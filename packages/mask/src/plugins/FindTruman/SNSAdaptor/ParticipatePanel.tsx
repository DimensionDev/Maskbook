import { useAccount } from '@masknet/web3-shared-evm'
import { makeStyles, useStylesExtends, useTabs } from '@masknet/theme'
import { useAsyncRetry } from 'react-use'
import { fetchAllPollsOrPuzzles, fetchUserStoryStatus, submitPoll, submitPuzzle } from '../Worker/apis'
import { Box, Button, Card, DialogActions, DialogContent } from '@mui/material'
import { TabContext, TabPanel } from '@mui/lab'
import StageCard from './StageCard'
import { useControlledDialog } from '../../../utils'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { useContext, useEffect, useState } from 'react'
import OptionsCard from './OptionsCard'
import ResultCard from './ResultCard'
import getUnixTime from 'date-fns/getUnixTime'
import { PostType, UserPollOrPuzzleStatus } from '../types'
import { FindTrumanContext } from '../context'
import AbstractTab, { AbstractTabProps } from '../../../components/shared/AbstractTab'
import { useTabsStyles } from './FindTrumanDialog'

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
    const account = useAccount()

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

    const [polls, setPolls] = useState<UserPollOrPuzzleStatus[]>([])

    useEffect(() => {
        if (account) {
            fetchAllPollsOrPuzzles(account).then((polls) => setPolls(polls))
        }
    }, [account, open])

    const handleSubmit = async (postType: PostType, pollId: string, choice: number) => {
        const target = pollId
        const from = account
        const timestamp = getUnixTime(Date.now())
        if (postType === PostType.Puzzle) {
            await submitPuzzle(account, { target, from, timestamp, choice })
        } else if (postType === PostType.Poll) {
            await submitPoll(account, { target, from, timestamp, choice })
        }
        const polls = await fetchAllPollsOrPuzzles(account)
        setPolls(polls)
        onUpdate()
    }

    const renderPoll = (poll: UserPollOrPuzzleStatus) => {
        return poll.status ? (
            <Card key={`${poll.type}_${poll.id}`} variant="outlined" className={classes.wrapper}>
                <OptionsCard
                    userStatus={poll}
                    onSubmit={async (choice) => {
                        return handleSubmit(poll.type, poll.id, choice)
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

    return (
        <InjectedDialog title={t('plugin_find_truman_dialog_participation_title')} open={open} onClose={onClose}>
            <DialogContent className={classes.dialogWrapper}>
                <TabContext value={currentTab}>
                    <div className={classes.abstractTabWrapper}>
                        <FindTrumanDialogTabs currentTab={currentTab} setTab={(tab) => onChange(null, tab)} />
                    </div>
                    <Box className={classes.tabPaneWrapper}>
                        <TabPanel className={classes.tabPane} value={ParticipationType.Critical}>
                            {polls?.filter((e) => e.critical).map((p) => renderPoll(p))}
                        </TabPanel>
                        <TabPanel className={classes.tabPane} value={ParticipationType.NonCritical}>
                            {polls?.filter((e) => !e.critical).map((p) => renderPoll(p))}
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
    const classes = useStylesExtends(useTabsStyles(), props)
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
