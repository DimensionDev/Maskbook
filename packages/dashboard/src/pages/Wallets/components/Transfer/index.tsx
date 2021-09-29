import { memo, useEffect } from 'react'
import { ContentContainer } from '../../../../components/ContentContainer'
import { Box, Tab } from '@material-ui/core'
import { useTabs } from '@masknet/theme'
import { TabContext, TabList, TabPanel } from '@material-ui/lab'
import { TransferERC20 } from './TransferERC20'
import { ERC721TokenDetailed, FungibleTokenDetailed, useNativeTokenDetailed } from '@masknet/web3-shared'
import { useLocation } from 'react-router-dom'
import { useDashboardI18N } from '../../../../locales'
import { TransferERC721 } from './TransferERC721'

export enum TransferTab {
    Token = 'Token',
    Collectibles = 'Collectibles',
}

const assetTabs = [TransferTab.Token, TransferTab.Collectibles] as const

export const Transfer = memo(() => {
    // todo: token and chain
    const t = useDashboardI18N()
    const { state } = useLocation() as {
        state: { token?: FungibleTokenDetailed; erc721Token?: ERC721TokenDetailed; type?: TransferTab } | null
    }
    const { value: nativeToken } = useNativeTokenDetailed()
    const transferTabsLabel: Record<TransferTab, string> = {
        [TransferTab.Token]: t.wallets_assets_token(),
        [TransferTab.Collectibles]: t.wallets_assets_collectibles(),
    }
    const [currentTab, onChange, , setTab] = useTabs(TransferTab.Token, TransferTab.Collectibles)

    useEffect(() => {
        if (!state) return
        if (!state.erc721Token || state.type !== TransferTab.Collectibles) return

        setTab(TransferTab.Collectibles)
    }, [state])

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
                    <TabPanel value={TransferTab.Collectibles}>
                        <TransferERC721 />
                    </TabPanel>
                </TabContext>
            </Box>
        </ContentContainer>
    )
})
