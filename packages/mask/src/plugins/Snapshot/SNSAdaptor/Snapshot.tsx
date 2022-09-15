import { useContext } from 'react'
import { Box, Paper, Tab, Avatar, Typography, Chip } from '@mui/material'
import { makeStyles, MaskTabList, useTabs } from '@masknet/theme'
import { SnapshotContext } from '../context.js'
import { useProposal } from './hooks/useProposal.js'
import { ProposalTab } from './ProposalTab.js'
import { ProgressTab } from './ProgressTab.js'
import { ChainBoundary } from '../../../web3/UI/ChainBoundary.js'
import { useChainId } from '@masknet/plugin-infra/web3'
import { NetworkPluginID, resolveIPFS_URL } from '@masknet/web3-shared-base'
import { TabContext } from '@mui/lab'
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
            color: theme.palette.maskColor.second,
            '&:hover': {
                background: 'transparent',
            },
        },
        tabActive: {
            background: '#fff',
            color: theme.palette.maskColor.publicMain,
            '&:hover': {
                background: '#fff',
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
            background: '#fff !important',
        },
        active: {
            color: '#fff',
            backgroundColor: theme.palette.maskColor.success,
        },
        default: {
            color: '#fff',
            backgroundColor: new Color(theme.palette.maskColor.primary).alpha(0.1).toString(),
        },
        avatar: {
            boxShadow: '0px 6px 12px rgba(81, 62, 255, 0.2)',
            backdropFilter: 'blur(8px)',
        },
    }
})

export function Snapshot() {
    const { classes } = useStyles()
    const identifier = useContext(SnapshotContext)
    const { payload: proposal } = useProposal(identifier.id)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const [currentTab, onChange, tabs] = useTabs('Proposal', 'Progress')
    const { t } = useI18N()
    const renderTab = () => {
        const tabMap = {
            [tabs.Proposal]: <ProposalTab />,
            [tabs.Progress]: <ProgressTab />,
        }
        return tabMap[currentTab]
    }

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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography fontSize={18} fontWeight="bold">
                            {proposal.space.name}
                        </Typography>
                        <Box sx={{ display: 'flex' }}>
                            <Typography fontSize={14} sx={{ paddingRight: 1 }}>
                                by
                            </Typography>
                            <Typography fontSize={14} fontWeight="bold">
                                {proposal.space.id}
                            </Typography>
                        </Box>
                    </Box>
                    <Typography fontSize={14} fontWeight="bold">
                        {proposal.title}
                    </Typography>
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

                <Paper className={classes.content}>{renderTab()}</Paper>
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
