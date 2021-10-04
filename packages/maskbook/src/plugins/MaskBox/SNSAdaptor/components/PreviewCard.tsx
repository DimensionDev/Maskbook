import { useState } from 'react'
import { Box } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import AbstractTab, { AbstractTabProps } from '../../../../components/shared/AbstractTab'
import { EthereumERC20TokenApprovedBoundary } from '../../../../web3/UI/EthereumERC20TokenApprovedBoundary'
import { EthereumWalletConnectedBoundary } from '../../../../web3/UI/EthereumWalletConnectedBoundary'
import ActionButton from '../../../../extension/options-page/DashboardComponents/ActionButton'
import { DrawDialog } from './DrawDialog'
import { useContainer } from 'unstated-next'
import { Context } from '../../hooks/useContext'
import { CardTab } from '../../type'
import { ArticlesTab } from './ArticlesTab'
import { DetailsTab } from './DetailsTab'
import { Placeholder } from './Placeholder'

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

    const { boxId, setBoxId, boxState, boxInfoResult, paymentTokenAmount, paymentTokenBalance, paymentTokenDetailed } =
        useContainer(Context)
    const { value: boxInfo, loading: loadingBoxInfo, error: errorBoxInfo } = boxInfoResult

    if (loadingBoxInfo) return <Placeholder>Loading...</Placeholder>
    if (errorBoxInfo) return <Placeholder>Something went wrong.</Placeholder>
    if (!boxInfo) return <Placeholder>Failed to load Box.</Placeholder>

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

    return (
        <Box>
            <AbstractTab height="" {...tabProps} state={state} />
            <EthereumWalletConnectedBoundary ActionButtonProps={{ size: 'medium' }}>
                <EthereumERC20TokenApprovedBoundary amount="0" ActionButtonProps={{ size: 'medium' }}>
                    <ActionButton size="medium" fullWidth variant="contained" onClick={() => setOpenDrawDialog(true)}>
                        Draw (20.00 USDT / Box) - {boxState}
                    </ActionButton>
                </EthereumERC20TokenApprovedBoundary>
            </EthereumWalletConnectedBoundary>
            <DrawDialog
                open={openDrawDialog}
                boxInfo={boxInfo}
                paymentTokenAmount={paymentTokenAmount}
                paymentTokenBalance={paymentTokenBalance.value ?? '0'}
                paymentTokenDetailed={paymentTokenDetailed.value ?? null}
                onClose={() => setOpenDrawDialog(false)}
            />
        </Box>
    )
}
