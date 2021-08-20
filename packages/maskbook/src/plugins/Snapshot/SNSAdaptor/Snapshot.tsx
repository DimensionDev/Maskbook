import { useState, useContext } from 'react'
import { Box, Card, CardHeader, CardContent, Typography, Tab, Tabs, Chip, Paper } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { SnapshotContext } from '../context'
import { useProposal } from './hooks/useProposal'
import { ProposalTab } from './ProposalTab'
import { ProgressTab } from './ProgressTab'

const useStyles = makeStyles()((theme) => {
    return {
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
            maxHeight: 'calc(var(--contentHeight) - var(--tabHeight))',
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
    }
})

export function Snapshot() {
    const { classes } = useStyles()
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
                }
            />
            <CardContent className={classes.content}>
                <Tabs
                    className={classes.tabs}
                    indicatorColor="primary"
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
                <Paper className={classes.body}>
                    {tabIndex === 0 ? <ProposalTab /> : null}
                    {tabIndex === 1 ? <ProgressTab /> : null}
                </Paper>
            </CardContent>
        </Card>
    )
}
