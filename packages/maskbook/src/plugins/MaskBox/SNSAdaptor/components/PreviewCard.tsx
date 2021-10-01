import { useState } from 'react'
import { Box, Typography } from '@material-ui/core'
import AbstractTab, { AbstractTabProps } from '../../../../components/shared/AbstractTab'
import { makeStyles } from '@masknet/theme'
import { EthereumERC20TokenApprovedBoundary } from '../../../../web3/UI/EthereumERC20TokenApprovedBoundary'
import { EthereumWalletConnectedBoundary } from '../../../../web3/UI/EthereumWalletConnectedBoundary'
import ActionButton from '../../../../extension/options-page/DashboardComponents/ActionButton'
import { DrawDialog } from './DrawDialog'
import { useContainer } from 'unstated-next'
import { Context } from '../../hooks/useContext'
import { CardTab } from '../../type'
import { ArticlesTab } from './ArticlesTab'
import { DetailsTab } from './DetailsTab'

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

export interface PreviewCardProps {}

export function PreviewCard(props: PreviewCardProps) {
    const { classes: tabClasses } = useTabsStyles()
    const state = useState(CardTab.Articles)
    const [openDrawDialog, setOpenDrawDialog] = useState(false)

    const { boxId, setBoxId, boxState, boxInfoResult } = useContainer(Context)
    const { value: boxInfo, loading: loadingBoxInfo, error: errorBoxInfo } = boxInfoResult

    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: 'Articles',
                children: boxInfo ? <ArticlesTab boxInfo={boxInfo} /> : null,
                sx: { p: 0 },
            },
            {
                label: 'Details',
                children: boxInfo ? <DetailsTab boxInfo={boxInfo} /> : null,
                sx: { p: 0 },
            },
        ],
        state,
        classes: tabClasses,
    }

    if (loadingBoxInfo) return <Typography color="textPrimary">Loading...</Typography>
    if (errorBoxInfo) return <Typography color="textPrimary">Something went wrong.</Typography>
    if (!boxInfo) return <Typography color="textPrimary">Failed to load Box.</Typography>

    return (
        <Box>
            <AbstractTab height="" {...tabProps}></AbstractTab>
            <EthereumWalletConnectedBoundary ActionButtonProps={{ size: 'medium' }}>
                <EthereumERC20TokenApprovedBoundary amount="0" ActionButtonProps={{ size: 'medium' }}>
                    <ActionButton size="medium" fullWidth variant="contained" onClick={() => setOpenDrawDialog(true)}>
                        Draw (20.00 USDT / Box) - {boxState}
                    </ActionButton>
                </EthereumERC20TokenApprovedBoundary>
            </EthereumWalletConnectedBoundary>
            <DrawDialog boxInfo={boxInfo} open={openDrawDialog} onClose={() => setOpenDrawDialog(false)} />
        </Box>
    )
}
