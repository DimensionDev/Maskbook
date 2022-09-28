import { useContext } from 'react'
import { Box, Tab, Avatar, Typography, Chip } from '@mui/material'
import { makeStyles, MaskTabList, ShadowRootTooltip, useTabs } from '@masknet/theme'
import { SnapshotContext } from '../context.js'
import { useProposal } from './hooks/useProposal.js'
import { ProposalTab } from './ProposalTab.js'
import { ProgressTab } from './ProgressTab.js'
import { ChainBoundary } from '../../../web3/UI/ChainBoundary.js'
import { useChainId } from '@masknet/plugin-infra/web3'
import { NetworkPluginID, resolveIPFS_URL } from '@masknet/web3-shared-base'
import { TabContext, TabPanel } from '@mui/lab'
import Color from 'color'
import { useI18N } from '../../../utils/index.js'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            '--contentHeight': '400px',
            '--tabHeight': '35px',
            width: '100%',
            padding: 0,
        },
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
            color: theme.palette.maskColor.publicMain,
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
    const { payload: proposal } = useProposal(identifier.id)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const [currentTab, onChange, tabs] = useTabs('Proposal', 'Progress')
    const { t } = useI18N()

    const Tabs = [
        {
            value: tabs.Proposal,
            label: t('plugin_snapshot_proposal'),
        },
        {
            value: tabs.Progress,
            label: t('plugin_snapshot_progress'),
        },
    ]

    return (
        <TabContext value={currentTab}>
            <Box className={classes.header}>
                <Avatar src={resolveIPFS_URL(proposal.space.avatar)} className={classes.avatar} />
                <Box className={classes.title}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography fontSize={18} fontWeight="bold">
                            {proposal.space.name}
                        </Typography>
                        <Box sx={{ display: 'flex' }}>
                            <Typography
                                fontSize={14}
                                sx={{ paddingRight: 1 }}
                                color={theme.palette.maskColor.publicSecond}>
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
                            sx={{ width: 334, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                            {proposal.title}
                        </Typography>
                    </ShadowRootTooltip>
                </Box>
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
