import { useState } from 'react'
import { Tab, Tabs, makeStyles, Card, Typography, Button, Box } from '@material-ui/core'
import { TabContext, TabPanel } from '@material-ui/lab'
import { TimelineView } from './TimelineView'
import { GameStatsView } from './GameStatsView'
import { OtherPlayersView } from './OtherPlayersView'
import { PersonalView } from './PersonalView'
import { useGameInfo } from '../hooks/useGameInfo'
import type { GoodGhostingInfo } from '../types'
import { usePoolData } from '../hooks/usePoolData'
import { useOtherPlayerInfo } from '../hooks/useOtherPlayerInfo'
import { useCurrentPlayer } from '../hooks/usePersonalGameInfo'

const useStyles = makeStyles((theme) => ({
    root: {
        padding: theme.spacing(2),
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
    const { value: info, error, loading, retry } = useGameInfo()

    if (loading) {
        return <Typography color="textPrimary">Loading...</Typography>
    } else if (error || !info) {
        return (
            <Box display="flex" flexDirection="column" alignItems="center">
                <Typography color="textPrimary">Something went wrong.</Typography>
                <Button sx={{ marginTop: 1 }} size="small" onClick={retry}>
                    Retry
                </Button>
            </Box>
        )
    }

    return <PreviewCardWithGameInfo info={info} />
}

interface PreviewCardWithGameInfoProps {
    info: GoodGhostingInfo
}

function PreviewCardWithGameInfo(props: PreviewCardWithGameInfoProps) {
    const classes = useStyles()
    const [activeTab, setActiveTab] = useState(GoodGhostingTab.Game)

    const finDataResult = usePoolData(props.info)
    const otherPlayerResult = useOtherPlayerInfo(props.info.numberOfPlayers)
    const currentPlayerResult = useCurrentPlayer()

    return (
        <Card variant="outlined" className={classes.root} elevation={0}>
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
                    <GameStatsView info={props.info} finDataResult={finDataResult} />
                </TabPanel>
                <TabPanel value={GoodGhostingTab.Timeline} sx={{ flex: 1 }}>
                    <TimelineView info={props.info}></TimelineView>
                </TabPanel>
                <TabPanel value={GoodGhostingTab.Personal} sx={{ flex: 1 }}>
                    <PersonalView info={props.info} currentPlayerResult={currentPlayerResult} />
                </TabPanel>
                <TabPanel value={GoodGhostingTab.Everyone} sx={{ flex: 1 }}>
                    <OtherPlayersView info={props.info} otherPlayerResult={otherPlayerResult} />
                </TabPanel>
            </TabContext>
        </Card>
    )
}
