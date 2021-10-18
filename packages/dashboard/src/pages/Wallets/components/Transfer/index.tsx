import { memo } from 'react'
import { ContentContainer } from '../../../../components/ContentContainer'
import { Box, Tab } from '@material-ui/core'
import { useTabs } from '@masknet/theme'
import { TabContext, TabList, TabPanel } from '@material-ui/lab'
import { TransferERC20 } from './TransferERC20'
import { FungibleTokenDetailed, useNativeTokenDetailed } from '@masknet/web3-shared-evm'
import { useLocation } from 'react-router-dom'
import { useDashboardI18N } from '../../../../locales'

export enum TransferTab {
    Token = 'Token',
    // Collectibles = 'Collectibles',
}

const assetTabs = [TransferTab.Token] as const

export const Transfer = memo(() => {
    // todo: token and chain
    const t = useDashboardI18N()
    const { state } = useLocation() as { state: { token: FungibleTokenDetailed } | null }
    const { value: nativeToken } = useNativeTokenDetailed()
    const transferTabsLabel: Record<TransferTab, string> = {
        [TransferTab.Token]: t.wallets_assets_token(),
        // [TransferTab.Collectibles]: t.wallets_assets_collectibles(),
    }
    const [currentTab, onChange] = useTabs(TransferTab.Token)

    if (!nativeToken && !state?.token) return null

    return (
        <ContentContainer sx={{ marginTop: 3, display: 'flex', flexDirection: 'column' }}>
            <Box>
                <TabContext value={currentTab}>
                    <TabList onChange={onChange}>
                        {assetTabs.map((key) => (
                            <Tab key={key} value={key} label={transferTabsLabel[key]} />
                        ))}
                    </TabList>
                    <TabPanel value={TransferTab.Token}>
                        <TransferERC20 token={state?.token! || nativeToken} />
                    </TabPanel>
                    {/*<TabPanel value={TransferTab.Collectibles}>todo</TabPanel>*/}
                </TabContext>
            </Box>
        </ContentContainer>
    )
})
