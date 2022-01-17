import { useAccount } from '@masknet/web3-shared-evm'
import { makeStyles } from '@masknet/theme'
import { useAsyncRetry } from 'react-use'
import { fetchAllPollsOrPuzzles, fetchUserStoryStatus, submitPoll, submitPuzzle } from '../Worker/apis'
import { Button, Card, DialogActions, DialogContent } from '@mui/material'
import StageCard from './StageCard'
import { useControlledDialog } from '../../../utils'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { useContext, useEffect, useState } from 'react'
import OptionsCard from './OptionsCard'
import ResultCard from './ResultCard'
import getUnixTime from 'date-fns/getUnixTime'
import { PostType, UserPollOrPuzzleStatus } from '../types'
import { FindTrumanContext } from '../context'

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
}))

interface ParticipatePanelProps {
    storyId?: string
}

export default function ParticipatePanel(props: ParticipatePanelProps) {
    const { storyId } = props
    const { classes } = useStyles()
    const { t } = useContext(FindTrumanContext)
    const account = useAccount()

    const [critical, setCritical] = useState(false)
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
                                setCritical(true)
                                onDialogOpen()
                            }}>
                            {t('plugin_find_truman_dialog_critical')}
                        </Button>
                        <Button
                            fullWidth
                            color="primary"
                            variant="outlined"
                            onClick={() => {
                                setCritical(false)
                                onDialogOpen()
                            }}>
                            {t('plugin_find_truman_dialog_noncritical')}
                        </Button>
                    </DialogActions>
                </>
            )}
            <ParticipateDialog
                account={account}
                critical={critical}
                open={isDialogOpen}
                onClose={onDialogClose}
                onUpdate={onUpdate}
            />
        </div>
    )
}

interface ParticipateDialogProps {
    account: string
    critical: boolean
    open: boolean
    onClose: () => void
    onUpdate: () => void
}

function ParticipateDialog(props: ParticipateDialogProps) {
    const { account, critical, open, onClose, onUpdate } = props
    const { classes } = useStyles()
    const { t } = useContext(FindTrumanContext)

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

    return (
        <InjectedDialog
            title={t(
                critical ? 'plugin_find_truman_dialog_critical_title' : 'plugin_find_truman_dialog_noncritical_title',
            )}
            open={open}
            onClose={onClose}>
            <DialogContent>
                {polls
                    ?.filter((e) => e.critical === critical)
                    .map((p) => {
                        if (p.status) {
                            return (
                                <Card key={`${p.type}_${p.id}`} variant="outlined" className={classes.wrapper}>
                                    <OptionsCard
                                        userStatus={p}
                                        onSubmit={async (choice) => {
                                            return handleSubmit(p.type, p.id, choice)
                                        }}
                                    />
                                </Card>
                            )
                        } else {
                            return (
                                <Card key={`${p.type}_${p.id}`} variant="outlined" className={classes.wrapper}>
                                    <ResultCard
                                        type={p.type}
                                        userStatus={p}
                                        result={{
                                            ...p,
                                            correct: p.result,
                                            count: p.count || [],
                                        }}
                                    />
                                </Card>
                            )
                        }
                    })}
            </DialogContent>
        </InjectedDialog>
    )
}
