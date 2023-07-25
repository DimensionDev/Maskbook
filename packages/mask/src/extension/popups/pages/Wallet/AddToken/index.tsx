import { memo, useCallback, useMemo, useState } from 'react'
import { MaskTabList, makeStyles, useTabs } from '@masknet/theme'
import { FungibleTokenList, SelectNetworkSidebar, TokenListMode, AddCollectibles } from '@masknet/shared'
import { useRowSize } from '@masknet/shared-base-ui'
import {
    useBlockedFungibleTokens,
    useChainContext,
    useNetworkDescriptors,
    useWeb3State,
} from '@masknet/web3-hooks-base'
import { ChainId, type SchemaType } from '@masknet/web3-shared-evm'
import { Tab } from '@mui/material'
import { TabContext, TabPanel } from '@mui/lab'
import { NormalHeader } from '../../../components/index.js'
import { NetworkPluginID, PopupRoutes } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useNavigate, useParams } from 'react-router-dom'
import { useAsyncFn } from 'react-use'
import type { NonFungibleTokenContract } from '@masknet/web3-shared-base'
import { useI18N } from '../../../../../utils/index.js'
import { useTitle } from '../../../hook/useTitle.js'
import { sortBy } from 'lodash-es'

const useStyles = makeStyles<{ currentTab: TabType }>()((theme, { currentTab }) => ({
    content: {
        flex: 1,
        padding: '16px 16px 0 16px',
        display: 'flex',
    },
    channel: {
        flex: 1,
        '& > div': {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
        },
    },
    listBox: {
        flex: 1,
        marginTop: 36,
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    wrapper: {
        paddingTop: theme.spacing(2),
    },
    input: {
        fontSize: 12,
        background: '#F7F9FA',
    },
    tabs: {
        flex: 'none!important',
        paddingTop: '0px!important',
        paddingLeft: 16,
        paddingRight: 16,
    },
    panel: {
        padding: theme.spacing(0),
        background: theme.palette.maskColor.bottom,
        flex: 1,
        overflow: 'auto',
    },
    main: {
        flexGrow: 1,
        height: '100%',
        boxSizing: 'border-box',
        overflow: 'auto',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    searchInput: {
        position: 'absolute',
        left: 16,
        width: 368,
        zIndex: 50,
    },
    sidebar: {
        marginTop: currentTab === TabType.Token ? 52 : 0,
    },
    grid: {
        gridTemplateColumns: 'repeat(auto-fill, minmax(40%, 1fr))',
    },
    form: {
        padding: 0,
        height: 490,
    },
    nftContent: {
        overflow: 'auto',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
}))

enum TabType {
    Token = 'Token',
    NFT = 'NFT',
}

const CollectibleSupportedChains: Web3Helper.ChainIdAll[] = [
    ChainId.Mainnet,
    ChainId.BSC,
    ChainId.Matic,
    ChainId.Arbitrum,
    ChainId.Optimism,
    ChainId.Avalanche,
    ChainId.xDai,
]

const TokenSupportedChains: Web3Helper.ChainIdAll[] = [
    ChainId.Mainnet,
    ChainId.BSC,
    ChainId.Matic,
    ChainId.Arbitrum,
    ChainId.xDai,
    ChainId.Fantom,
    ChainId.Optimism,
    ChainId.Avalanche,
    ChainId.Aurora,
    ChainId.Conflux,
    ChainId.Astar,
]

const AddToken = memo(function AddToken() {
    const { t } = useI18N()

    const blackList = useBlockedFungibleTokens()
    const rowSize = useRowSize()
    const navigate = useNavigate()
    const { chainId: chainId_ } = useParams()
    const { account } = useChainContext()
    const [currentTab, onChange] = useTabs(TabType.Token, TabType.Token, TabType.NFT)
    const { classes } = useStyles({ currentTab })

    const [chainId, setChainId] = useState<Web3Helper.ChainIdAll>(
        chainId_ ? Number.parseInt(chainId_, 10) : ChainId.Mainnet,
    )

    const allNetworks = useNetworkDescriptors(NetworkPluginID.PLUGIN_EVM)

    const supportedChains = currentTab === TabType.Token ? TokenSupportedChains : CollectibleSupportedChains

    const networks = useMemo(() => {
        return sortBy(
            allNetworks.filter((x) => x.isMainnet && supportedChains.includes(x.chainId)),
            (x) => supportedChains.indexOf(x.chainId),
        )
    }, [allNetworks, supportedChains])

    const changeTab = useCallback(
        (event: object, value: string) => {
            onChange(event, value)
            if (currentTab === TabType.Token && !CollectibleSupportedChains.includes(chainId)) {
                setChainId(ChainId.Mainnet)
            }
        },
        [onChange, chainId, currentTab],
    )

    useTitle(t('add_assets'))

    const { Token } = useWeb3State(NetworkPluginID.PLUGIN_EVM)

    const [{ loading: loadingAddCustomNFTs }, addCustomNFTs] = useAsyncFn(
        async (result: [contract: NonFungibleTokenContract<ChainId, SchemaType>, tokenIds: string[]]) => {
            await Token?.addNonFungibleCollection?.(account, result[0], result[1])
            navigate(PopupRoutes.Wallet)
        },
        [account],
    )

    return (
        <TabContext value={currentTab}>
            <NormalHeader
                tabList={
                    <MaskTabList onChange={changeTab} aria-label="persona-tabs" classes={{ root: classes.tabs }}>
                        <Tab label={t('popups_wallet_token')} value={TabType.Token} />
                        <Tab label={t('popups_wallet_collectible')} value={TabType.NFT} />
                    </MaskTabList>
                }
            />
            <div className={classes.content}>
                <div className={classes.sidebar}>
                    <SelectNetworkSidebar
                        hiddenAllButton
                        chainId={chainId}
                        onChainChange={(chainId) => setChainId(chainId ?? ChainId.Mainnet)}
                        networks={networks}
                        pluginID={NetworkPluginID.PLUGIN_EVM}
                        gridProps={{ gap: 0 }}
                    />
                </div>
                <div className={classes.main}>
                    <TabPanel className={classes.panel} value={TabType.Token}>
                        <FungibleTokenList
                            chainId={chainId}
                            isHiddenChainIcon={false}
                            mode={TokenListMode.Manage}
                            classes={{
                                channel: classes.channel,
                                listBox: classes.listBox,
                                searchInput: classes.searchInput,
                            }}
                            blacklist={blackList.map((x) => x.address)}
                            FixedSizeListProps={{ height: 474, itemSize: rowSize + 16, className: classes.wrapper }}
                            SearchTextFieldProps={{ className: classes.input }}
                        />
                    </TabPanel>
                    <TabPanel className={classes.panel} value={TabType.NFT}>
                        <AddCollectibles
                            pluginID={NetworkPluginID.PLUGIN_EVM}
                            chainId={chainId}
                            onClose={addCustomNFTs}
                            disabled={loadingAddCustomNFTs}
                            classes={{ grid: classes.grid, form: classes.form, main: classes.nftContent }}
                        />
                    </TabPanel>
                </div>
            </div>
        </TabContext>
    )
})

export default AddToken
