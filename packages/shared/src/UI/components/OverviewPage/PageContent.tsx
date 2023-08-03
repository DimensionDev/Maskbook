import { MaskTabList, makeStyles, useTabs } from '@masknet/theme'
import { TabContext, TabPanel } from '@mui/lab'
import { Tab } from '@mui/material'
import { memo } from 'react'
import { CollectionList, UserAssetsProvider } from '../../../index.js'
import { NetworkPluginID } from '@masknet/shared-base'
import { Network } from './Network.js'
import { useChainRuntime } from '../AssetsManagement/ChainRuntimeProvider.js'
import { Context } from './hooks/useAssets.js'
import { HistoryTable } from './History/HistoryTable/index.js'
import { ChainId } from '@masknet/web3-shared-evm'
import { TokenPage } from './TokenPage.js'

const useStyles = makeStyles()((theme) => ({
    tabs: {
        display: 'flex',
        flexDirection: 'row',
    },
    menuBar: {
        flex: 1,
        display: 'flex',
        justifyContent: 'end',
    },
}))

const gridProps = {
    columns: 'repeat(auto-fill, minmax(20%, 1fr))',
}

interface PageContentProps {
    account: string
}

export const PageContent = memo<PageContentProps>(({ account }) => {
    const { classes } = useStyles()
    const [currentTab, onChange, tabs, setTab] = useTabs('Token', 'Nfts', 'History')
    const { chainId, pluginID } = useChainRuntime()

    if (!account) return null
    return (
        <Context.Provider initialState={{ chainId, pluginID, account }}>
            <TabContext value={currentTab}>
                <div className={classes.tabs}>
                    <MaskTabList variant="base" onChange={onChange} aria-label="PageContent">
                        <Tab label="Token" value={tabs.Token} />
                        <Tab label="Nfts" value={tabs.Nfts} />
                        <Tab label="History" value={tabs.History} />
                    </MaskTabList>
                    <div className={classes.menuBar}>
                        <Network />
                    </div>
                </div>
                <TabPanel value={tabs.Token} style={{ padding: 8, maxHeight: 600, overflowY: 'auto' }}>
                    <TokenPage seeMore={() => setTab('History')} />
                </TabPanel>
                <TabPanel value={tabs.Nfts} style={{ padding: 8, maxHeight: 600, overflowY: 'auto' }}>
                    <UserAssetsProvider pluginID={NetworkPluginID.PLUGIN_EVM} account={account}>
                        <CollectionList height={479} gridProps={gridProps} disableWindowScroll disableSidebar />
                    </UserAssetsProvider>
                </TabPanel>
                <TabPanel value={tabs.History} style={{ padding: 8, maxHeight: 600, overflowY: 'auto' }}>
                    <HistoryTable selectedChainId={chainId ?? ChainId.Mainnet} />
                </TabPanel>
            </TabContext>
        </Context.Provider>
    )
})
