import { useState, useContext, Suspense } from 'react'
import {
    makeStyles,
    createStyles,
    Box,
    Card,
    CardHeader,
    CardContent,
    Typography,
    Tab,
    Tabs,
    Chip,
    Paper,
    Skeleton,
} from '@material-ui/core'
import { SnapshotCard } from './SnapshotCard'
import { SnapshotContext } from '../context'
import { useProposal } from '../hooks/useProposal'
import { ProposalTab } from './ProposalTab'
import { ProgressTab } from './ProgressTab'

const useStyles = makeStyles((theme) => {
    return createStyles({
        root: {
            '--contentHeight': '400px',
            '--tabHeight': '35px',

            width: '100%',
            border: `solid 1px ${theme.palette.divider}`,
            padding: 0,
        },
        content: {
            width: '100%',
            minHeight: 'var(--contentHeight)',
            display: 'flex',
            flexDirection: 'column',
            padding: '0 !important',
        },
        body: {
            flex: 1,
            minHeight: 'calc(var(--contentHeight) - var(--tabHeight))',
            overflow: 'auto',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        tabs: {
            height: 'var(--tabHeight)',
            width: '100%',
            minHeight: 'unset',
            borderTop: `solid 1px ${theme.palette.divider}`,
            borderBottom: `solid 1px ${theme.palette.divider}`,
        },
        tab: {
            height: 'var(--tabHeight)',
            minHeight: 'unset',
            minWidth: 'unset',
        },
        subtitle: {
            fontSize: 12,
            marginRight: theme.spacing(0.5),
        },
        fallbackText: {
            marginLeft: theme.spacing(1),
        },
        fallbackWrapper: {
            padding: theme.spacing(2),
        },
        skeleton: {
            margin: theme.spacing(1.5),
            '&:first-child': {
                marginTop: theme.spacing(2.5),
            },
        },
    })
})

export function Snapshot() {
    const classes = useStyles()
    const identifier = useContext(SnapshotContext)
    const {
        payload: { proposal, message },
    } = useProposal(identifier.id)

    const [tabIndex, setTabIndex] = useState(0)
    const tabs = [
        <Tab className={classes.tab} key="proposal" label="Proposal" />,
        <Tab className={classes.tab} key="progress" label="Progress" />,
    ]

    return (
        <Card className={classes.root} elevation={0}>
            <CardHeader
                title={
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography sx={{ marginRight: 1 }}>
                            <Typography component="span" sx={{ marginRight: 0.5 }}>
                                {message.payload.name}
                            </Typography>
                            <Typography color="textSecondary" component="span">
                                #{identifier.id.slice(0, 7)}
                            </Typography>
                        </Typography>
                        <Chip color="primary" size="small" label={proposal.status} />
                    </Box>
                }
                subheader={
                    <Box display="flex" alignItems="center" sx={{ marginTop: 0.5 }}>
                        <Typography color="textSecondary" variant="body2">
                            {identifier.space}
                        </Typography>
                    </Box>
                }></CardHeader>
            <CardContent className={classes.content}>
                <Tabs
                    className={classes.tabs}
                    textColor="primary"
                    variant="fullWidth"
                    value={tabIndex}
                    onChange={(ev: React.ChangeEvent<{}>, newValue: number) => setTabIndex(newValue)}
                    TabIndicatorProps={{
                        style: {
                            display: 'none',
                        },
                    }}>
                    {tabs}
                </Tabs>
                <Suspense
                    fallback={
                        <section className={classes.fallbackWrapper}>
                            <SnapshotCard title="Information">
                                {new Array(5).fill(0).map((_, i) => (
                                    <Skeleton
                                        className={classes.skeleton}
                                        animation="wave"
                                        variant="rectangular"
                                        width={i === 0 ? '80%' : '60%'}
                                        height={15}></Skeleton>
                                ))}
                            </SnapshotCard>
                        </section>
                    }>
                    <Paper className={classes.body}>
                        {tabIndex === 0 ? <ProposalTab /> : null}
                        {tabIndex === 1 ? <ProgressTab /> : null}
                    </Paper>
                </Suspense>
            </CardContent>
        </Card>
    )
}
