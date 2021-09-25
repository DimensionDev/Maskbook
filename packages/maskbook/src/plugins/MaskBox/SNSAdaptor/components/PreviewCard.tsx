import { useState } from 'react'
import { Box, Typography } from '@material-ui/core'
import AbstractTab, { AbstractTabProps } from '../../../../components/shared/AbstractTab'
import { makeStyles } from '@masknet/theme'
import { useChainId } from '@masknet/web3-shared'
import { EthereumERC20TokenApprovedBoundary } from '../../../../web3/UI/EthereumERC20TokenApprovedBoundary'
import { EthereumWalletConnectedBoundary } from '../../../../web3/UI/EthereumWalletConnectedBoundary'
import ActionButton from '../../../../extension/options-page/DashboardComponents/ActionButton'
import { DrawDialog } from './DrawDialog'

enum CardTab {
    Articles = 1,
    Details = 2,
}

const useTabsStyles = makeStyles()((theme) => ({
    tab: {
        height: 36,
        minHeight: 36,
        fontWeight: 300,
        color: theme.palette.mode === 'light' ? '#15181B' : '#D9D9D9',
    },
    tabs: {
        backgroundColor: theme.palette.mode === 'light' ? '#F7F9FA' : '#17191D',
        width: '100%',
        height: 36,
        minHeight: 36,
        margin: `0 ${location.host.includes('minds') ? '12px' : 'auto'}`,
        '& .Mui-selected': {
            backgroundColor: '#1C68F3',
            color: '#fff !important',
        },
        borderRadius: 4,
    },
    indicator: {
        display: 'none',
    },
    tabPanel: {
        marginTop: theme.spacing(3),
    },
}))

const useStyles = makeStyles()((theme) => ({
    focusTab: {
        backgroundColor: theme.palette.mode === 'light' ? 'rgba(247, 249, 250, 1)' : 'rgba(255, 255, 255, 0.08)',
    },
    tabPaper: {
        position: 'sticky',
        top: 0,
        zIndex: 5000,
    },
}))

export interface PreviewCardProps {
    id: string
}

export function PreviewCard(props: PreviewCardProps) {
    const { classes } = useStyles()
    const { classes: tabClasses } = useTabsStyles()
    const state = useState(CardTab.Articles)

    const chainId = useChainId()
    const [openDrawDialog, setOpenDrawDialog] = useState(false)

    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: 'Articles',
                children: <Typography color="textPrimary">Articles</Typography>,
                sx: { p: 0 },
            },
            {
                label: 'Details',
                children: <Typography color="textPrimary">Details</Typography>,
                sx: { p: 0 },
            },
        ],
        state,
        classes: tabClasses,
    }
    return (
        <Box>
            <AbstractTab height="" {...tabProps}></AbstractTab>
            <EthereumWalletConnectedBoundary>
                <EthereumERC20TokenApprovedBoundary amount="0">
                    <ActionButton size="medium" fullWidth variant="contained" onClick={() => setOpenDrawDialog(true)}>
                        Draw
                    </ActionButton>
                </EthereumERC20TokenApprovedBoundary>
            </EthereumWalletConnectedBoundary>
            <DrawDialog open={openDrawDialog} onClose={() => setOpenDrawDialog(false)} />
        </Box>
    )
}
