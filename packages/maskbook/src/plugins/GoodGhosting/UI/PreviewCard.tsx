import { useEffect, useState } from 'react'
import { Tab, Tabs, makeStyles, Card, Typography } from '@material-ui/core'
import { TabContext, TabPanel } from '@material-ui/lab'
import { useI18N } from '../../../utils'
import { useGoodGhostingContract } from '../contracts/useGoodGhostingContract'
import { useAccount, useSingleContractMultipleData } from '@masknet/web3-shared'
import { addSeconds, formatDuration, differenceInDays } from 'date-fns'
import type { GoodGhostingInfo, Player, PlayerStandings, TimelineEvent } from '../types'
import { useAsyncRetry } from 'react-use'
import { TimelineView } from './TimelineView'
import { GameStatsView } from './GameStatsView'
import { OtherPlayersView } from './OtherPlayersView'
import { PersonalView } from './PersonalView'

const useStyles = makeStyles((theme) => ({
    root: {
        padding: theme.spacing(2),
    },
    logo: {
        textAlign: 'center',
        '& > *': {
            width: 'auto',
            height: 100,
        },
    },
    title: {
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        display: 'flex',
        alignItems: 'center',
        '& > :last-child': {
            marginTop: 4,
            marginLeft: 4,
        },
    },
    description: {
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
    },
    data: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    meta: {
        fontSize: 10,
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        display: 'flex',
        alignItems: 'center',
        '& svg': {
            marginRight: theme.spacing(0.5),
        },
    },
    avatar: {
        width: theme.spacing(2),
        height: theme.spacing(2),
        margin: theme.spacing(0, 1),
    },
    buttons: {
        padding: theme.spacing(4, 0, 0),
    },
    verified: {
        borderRadius: 50,
    },
    text: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        '-webkit-line-clamp': '4',
        '-webkit-box-orient': 'vertical',
    },
    tabs: {
        height: 'var(--tabHeight)',
        width: '100%',
        minHeight: 'unset',
        display: 'flex',
    },
    tab: {
        flex: 1,
        height: 'var(--tabHeight)',
        minHeight: 'unset',
        minWidth: 'unset',
    },
    timeline: {
        overflowX: 'auto',
        flexWrap: 'nowrap',
    },
    timelineCells: {
        whiteSpace: 'nowrap',
        padding: theme.spacing(2),
    },
}))

interface PreviewCardProps {
    id: string
}

enum GoodGhostingTab {
    Game = 'Game',
    Timeline = 'Timeline',
    Personal = 'Personal',
    Everyone = 'Everyone',
}

export function PreviewCard(props: PreviewCardProps) {
    const { t } = useI18N()
    const classes = useStyles()

    const [activeTab, setActiveTab] = useState(GoodGhostingTab.Game)
    const contract = useGoodGhostingContract()
    const account = useAccount()
    const [info, setInfo] = useState<GoodGhostingInfo>()
    const [results, calls, _, callback] = useSingleContractMultipleData(
        contract,
        Array(203).fill('iterablePlayers'),
        Array(203)
            .fill('')
            .map((_, i) => [i]),
    )
    const asyncResult = useAsyncRetry(() => callback(calls), [calls, callback])

    const [playerResults, playerCalls, __, playerCallback] = useSingleContractMultipleData(
        contract,
        Array(results.length).fill('players'),
        Array(results.length)
            .fill('')
            .map((_, i) => [results[i].value]),
    )
    const playerAsyncResult = useAsyncRetry(() => playerCallback(playerCalls), [playerCalls, playerCallback])

    const getGameInfo = async () => {
        const getReadableInterval = (roundLength: number) => {
            const baseDate = new Date(0)
            const dateAfterDuration = addSeconds(baseDate, roundLength)
            const dayDifference = differenceInDays(dateAfterDuration, baseDate)
            const weeks = Math.floor(dayDifference / 7)
            const days = Math.floor(dayDifference - weeks * 7)
            return formatDuration({
                weeks,
                days,
            })
        }

        const getTimelineEvent = (index: number, lastEventIndex: number) => {
            if (index === 0) {
                return {
                    eventOnDate: `Game Launched`,
                    ongoingEvent: `Join Round`,
                }
            } else if (index === 1) {
                return {
                    eventOnDate: `Join Deadline`,
                    ongoingEvent: `Deposit 2`,
                }
            } else if (index === lastEventIndex - 1) {
                return {
                    eventOnDate: `Deposit Deadline ${lastEventIndex - 1}`,
                    ongoingEvent: `Waiting Round`,
                }
            } else if (index === lastEventIndex) {
                return {
                    eventOnDate: `Waiting Period Ends`,
                    ongoingEvent: `Withdraw`,
                }
            } else {
                return {
                    eventOnDate: `Deposit Deadline ${index}`,
                    ongoingEvent: `Deposit ${index + 1}`,
                }
            }
        }
        const getTimeline = (startTime: number, roundDuration: number, numberOfRounds: number): TimelineEvent[] => {
            const initialDate = new Date(startTime * 1000)
            const rounds: TimelineEvent[] = []
            for (let i = 0; i <= numberOfRounds; i++) {
                rounds.push({
                    date: addSeconds(initialDate, roundDuration * i),
                    ...getTimelineEvent(i, numberOfRounds),
                })
            }
            return rounds
        }

        if (contract) {
            const [
                segmentPayment,
                firstSegmentStart,
                currentSegment,
                lastSegment,
                segmentLength,
                numberOfPlayers,
                totalGameInterest,
                totalGamePrincipal,
            ] = await Promise.all([
                contract.methods.segmentPayment().call(),
                contract.methods.firstSegmentStart().call(),
                contract.methods.getCurrentSegment().call(),
                contract.methods.lastSegment().call(),
                contract.methods.segmentLength().call(),
                contract.methods.getNumberOfPlayers().call(),
                contract.methods.totalGameInterest().call(),
                contract.methods.totalGamePrincipal().call(),
            ])

            const info = {
                segmentPayment,
                firstSegmentStart: Number.parseInt(firstSegmentStart),
                currentSegment: Number.parseInt(currentSegment),
                lastSegment: Number.parseInt(lastSegment),
                segmentLength: Number.parseInt(segmentLength),
                numberOfPlayers: Number.parseInt(numberOfPlayers),
                totalGameInterest,
                totalGamePrincipal,
            }
            const timeline = getTimeline(info.firstSegmentStart, info.segmentLength, info.lastSegment + 1)
            setInfo({
                ...info,
                segmentLengthFormatted: getReadableInterval(info.segmentLength),
                gameLengthFormatted: getReadableInterval(info.segmentLength * (info.lastSegment + 1)),
                timeline,
            })

            const lendingPool = await contract.methods.lendingPool().call()
            console.log('Lending Pool', lendingPool)
        }
    }

    useEffect(() => {
        getGameInfo()
    }, [])

    if (!info) return <Typography color="textPrimary">Loading...</Typography>

    let playerInfo: PlayerStandings = {
        winning: 0,
        waiting: 0,
        ghosts: 0,
        dropouts: 0,
    }

    const getPlayerInfo = (players: Player[], currentSegment: number): PlayerStandings => {
        const playerInfo = {
            winning: 0,
            waiting: 0,
            ghosts: 0,
            dropouts: 0,
        }

        players.forEach((player, i) => {
            const mostRecentSegmentPaid = Number.parseInt(player.mostRecentSegmentPaid)

            if (player.withdrawn) playerInfo.dropouts += 1
            else if (mostRecentSegmentPaid < currentSegment - 1) playerInfo.ghosts += 1
            else if (mostRecentSegmentPaid === currentSegment - 1) playerInfo.waiting += 1
            else if (mostRecentSegmentPaid === currentSegment) playerInfo.winning += 1
        })
        return playerInfo
    }
    if (playerResults.length) {
        const players: Player[] = playerResults.map((res) => res.value)
        playerInfo = getPlayerInfo(players, info.currentSegment)
    }

    return (
        <Card variant="outlined" className={classes.root} elevation={0}>
            <div className={classes.logo}>LOGO</div>
            <div className={classes.title}>
                <Typography variant="h6" color="textPrimary">
                    GOOD GHOSTING
                </Typography>
            </div>
            <TabContext value={activeTab}>
                <Tabs className={classes.tabs} value={activeTab} onChange={(event, tab) => setActiveTab(tab)}>
                    {[
                        GoodGhostingTab.Game,
                        GoodGhostingTab.Timeline,
                        GoodGhostingTab.Personal,
                        GoodGhostingTab.Everyone,
                    ].map((tab) => (
                        <Tab className={classes.tab} key={tab} value={tab} label={tab} />
                    ))}
                </Tabs>
                <TabPanel value={GoodGhostingTab.Game} sx={{ flex: 1 }}>
                    <GameStatsView info={info} />
                </TabPanel>
                <TabPanel value={GoodGhostingTab.Timeline} sx={{ flex: 1 }}>
                    <TimelineView timeline={info.timeline}></TimelineView>
                </TabPanel>
                <TabPanel value={GoodGhostingTab.Personal} sx={{ flex: 1 }}>
                    <PersonalView info={info} />
                </TabPanel>
                <TabPanel value={GoodGhostingTab.Everyone} sx={{ flex: 1 }}>
                    <OtherPlayersView standings={playerInfo} />
                </TabPanel>
            </TabContext>
        </Card>
    )
}
