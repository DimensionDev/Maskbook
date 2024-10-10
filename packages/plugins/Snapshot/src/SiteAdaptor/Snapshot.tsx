import { ChainBoundary } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import {
    MaskLightTheme,
    MaskTabList,
    ShadowRootTooltip,
    TextOverflowTooltip,
    makeStyles,
    useTabs,
} from '@masknet/theme'
import { useChainContext } from '@masknet/web3-hooks-base'
import { resolveIPFS_URL } from '@masknet/web3-shared-base'
import { TabContext, TabPanel } from '@mui/lab'
import { Avatar, Box, Chip, Tab, ThemeProvider, Typography } from '@mui/material'
import Color from 'color'
import { useContext } from 'react'
import { SnapshotContext } from '../context.js'
import { ProgressTab } from './ProgressTab.js'
import { ProposalTab } from './ProposalTab.js'
import { useProposal } from './hooks/useProposal.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => {
    return {
        header: {
            gap: theme.spacing(2),
            display: 'flex',
            padding: 12,
            alignItems: 'center',
        },
        title: {
            flex: 1,
        },
        body: {
            padding: 12,
            paddingBottom: 0,
        },
        tab: {
            whiteSpace: 'nowrap',
            background: 'transparent',
            color: theme.palette.maskColor.secondaryDark,
            '&:hover': {
                background: 'transparent',
            },
        },
        tabActive: {
            background: theme.palette.maskColor.white,
            color: `${theme.palette.maskColor.publicMain}!important`,
            '&:hover': {
                background: theme.palette.maskColor.white,
            },
        },
        content: {
            flex: 1,
            overflow: 'auto',
            borderRadius: '0 0 12px 12px',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
            background: theme.palette.maskColor.white,
        },
        active: {
            color: theme.palette.maskColor.white,
            backgroundColor: theme.palette.maskColor.success,
        },
        default: {
            color: theme.palette.maskColor.white,
            backgroundColor: new Color(theme.palette.maskColor.primary).alpha(0.1).toString(),
        },
        avatar: {
            boxShadow: '0px 6px 12px rgba(81, 62, 255, 0.2)',
            backdropFilter: 'blur(8px)',
            width: 48,
            height: 48,
        },
        shadowRootTooltip: {},
        tooltip: {
            backgroundColor: theme.palette.maskColor.publicMain,
            color: theme.palette.maskColor.white,
        },
        arrow: {
            color: theme.palette.maskColor.publicMain,
        },
    }
})

export function Snapshot() {
    const { classes, theme } = useStyles()
    const identifier = useContext(SnapshotContext)
    const proposal = useProposal(identifier.id)
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const [currentTab, onChange, tabs] = useTabs('Proposal', 'Progress')

    const Tabs = [
        {
            value: tabs.Proposal,
            label: <Trans>Proposal</Trans>,
        },
        {
            value: tabs.Progress,
            label: <Trans>Progress</Trans>,
        },
    ]

    return (
        <TabContext value={currentTab}>
            <Box className={classes.header}>
                <Avatar src={resolveIPFS_URL(proposal.space.avatar)} className={classes.avatar} />
                <ThemeProvider theme={MaskLightTheme}>
                    <Box className={classes.title}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <TextOverflowTooltip
                                as={ShadowRootTooltip}
                                PopperProps={{
                                    disablePortal: true,
                                }}
                                title={
                                    <Typography fontSize={18} fontWeight="bold">
                                        {proposal.space.name}
                                    </Typography>
                                }
                                placement="top"
                                classes={{ tooltip: classes.tooltip, arrow: classes.arrow }}
                                arrow>
                                <Typography
                                    fontSize={18}
                                    fontWeight="bold"
                                    color={theme.palette.maskColor.publicMain}
                                    sx={{
                                        width: 150,
                                        whiteSpace: 'nowrap',
                                        textOverflow: 'ellipsis',
                                        overflow: 'hidden',
                                    }}>
                                    {proposal.space.name}
                                </Typography>
                            </TextOverflowTooltip>
                            <Box sx={{ display: 'flex' }} color={theme.palette.maskColor.publicSecond}>
                                <Typography fontSize={14} sx={{ paddingRight: 1 }}>
                                    by
                                </Typography>
                                <Typography fontSize={14} fontWeight="700">
                                    {proposal.space.id}
                                </Typography>
                            </Box>
                        </Box>

                        <ShadowRootTooltip
                            PopperProps={{
                                disablePortal: true,
                            }}
                            title={<Typography className={classes.shadowRootTooltip}>{proposal.title}</Typography>}
                            placement="top"
                            classes={{ tooltip: classes.tooltip, arrow: classes.arrow }}
                            arrow>
                            <Typography
                                fontSize={14}
                                fontWeight="700"
                                color={theme.palette.maskColor.publicSecond}
                                sx={{ width: 300, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                {proposal.title}
                            </Typography>
                        </ShadowRootTooltip>
                    </Box>
                </ThemeProvider>
                <Box>
                    <Chip
                        className={proposal.status === 'Active' ? classes.active : classes.default}
                        label={proposal.status}
                    />
                </Box>
            </Box>
            <Box className={classes.body}>
                <MaskTabList variant="base" aria-label="snapshot" onChange={onChange}>
                    {Tabs.map((x, i) => (
                        <Tab
                            key={i}
                            value={x.value}
                            label={x.label}
                            className={x.value === currentTab ? classes.tabActive : classes.tab}
                        />
                    ))}
                </MaskTabList>
                <Box className={classes.content}>
                    <TabPanel value={tabs.Proposal} key={tabs.Proposal} sx={{ padding: 0 }}>
                        <ProposalTab />
                    </TabPanel>
                    <TabPanel value={tabs.Progress} key={tabs.Progress} sx={{ padding: 0 }}>
                        <ProgressTab />
                    </TabPanel>
                </Box>
            </Box>
            <Box style={{ padding: 12 }}>
                <ChainBoundary
                    expectedPluginID={NetworkPluginID.PLUGIN_EVM}
                    expectedChainId={chainId}
                    ActionButtonPromiseProps={{ variant: 'roundedDark' }}
                />
            </Box>
        </TabContext>
    )
}
