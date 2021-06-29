import { useState } from 'react'
import { Tab, Tabs, makeStyles, Card, Typography, Button, Box } from '@material-ui/core'
import { TabContext, TabPanel } from '@material-ui/lab'
import { useI18N } from '../../../utils'
import { useAccount } from '@masknet/web3-shared'
import { TimelineView } from './TimelineView'
import { GameStatsView } from './GameStatsView'
import { OtherPlayersView } from './OtherPlayersView'
import { PersonalView } from './PersonalView'
import { useGameInfo } from '../hooks/useGameInfo'

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
    const { t } = useI18N()
    const classes = useStyles()

    const [activeTab, setActiveTab] = useState(GoodGhostingTab.Game)
    const account = useAccount()

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
                    <TimelineView info={info}></TimelineView>
                </TabPanel>
                <TabPanel value={GoodGhostingTab.Personal} sx={{ flex: 1 }}>
                    <PersonalView info={info} />
                </TabPanel>
                <TabPanel value={GoodGhostingTab.Everyone} sx={{ flex: 1 }}>
                    <OtherPlayersView info={info} />
                </TabPanel>
            </TabContext>
        </Card>
    )
}
