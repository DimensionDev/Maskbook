import { memo, useState } from 'react'
import { useAsyncFn } from 'react-use'
import { useNavigate, useParams } from 'react-router-dom'
import { AddCollectibles, FungibleTokenList, SelectNetworkSidebar, TokenListMode } from '@masknet/shared'
import { NetworkPluginID, PopupRoutes } from '@masknet/shared-base'
import { useRowSize } from '@masknet/shared-base-ui'
import { MaskTabList, makeStyles, usePopupCustomSnackbar, useTabs } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useBlockedFungibleTokens, useChainContext, useNetworks, useWeb3State } from '@masknet/web3-hooks-base'
import { TokenType, type NonFungibleTokenContract } from '@masknet/web3-shared-base'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { TabContext, TabPanel } from '@mui/lab'
import { Tab } from '@mui/material'
import { useI18N } from '../../../../../utils/index.js'
import { NormalHeader } from '../../../components/index.js'
import { useTitle } from '../../../hooks/index.js'
import { WalletAssetTabs } from '../type.js'

const useStyles = makeStyles<{ currentTab: TabType; searchError: boolean }>()((theme, { currentTab, searchError }) => ({
    content: {
        flex: 1,
        padding: '16px 16px 0 16px',
        display: 'flex',
        overflow: 'hidden',
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
        marginTop: searchError ? 54 : 36,
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
        transform: 'translateX(-36px)',
        width: 368,
        zIndex: 50,
    },
    sidebar: {
        marginTop: currentTab === TabType.Tokens ? (searchError ? 70 : 52) : 0,
        marginRight: theme.spacing(1.5),
        height: 432,
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
    Tokens = 'Tokens',
    Collectibles = 'Collectibles',
}

const AddToken = memo(function AddToken() {
    const { t } = useI18N()

    const blackList = useBlockedFungibleTokens()
    const rowSize = useRowSize()
    const navigate = useNavigate()
    const { chainId: defaultChainId, assetType } = useParams()
    const { account } = useChainContext()
    const [currentTab, onChange] = useTabs(
        assetType === TabType.Collectibles ? TabType.Collectibles : TabType.Tokens,
        TabType.Tokens,
        TabType.Collectibles,
    )
    const [searchError, setSearchError] = useState(false)
    const { classes } = useStyles({ currentTab, searchError })
    const allNetworks = useNetworks(NetworkPluginID.PLUGIN_EVM, true)

    const supportedChains = allNetworks.map((x) => x.chainId)
    const [chainId, setChainId] = useState<Web3Helper.ChainIdAll>(
        defaultChainId && supportedChains.includes(Number.parseInt(defaultChainId, 10))
            ? Number.parseInt(defaultChainId, 10)
            : ChainId.Mainnet,
    )

    useTitle(t('add_assets'))

    const { Token } = useWeb3State(NetworkPluginID.PLUGIN_EVM)

    const { showSnackbar } = usePopupCustomSnackbar()

    const [{ loading: loadingAddCustomNFTs }, addCustomNFTs] = useAsyncFn(
        async (result: [contract: NonFungibleTokenContract<ChainId, SchemaType>, tokenIds: string[]]) => {
            const [contract, tokenIds] = result
            await Token?.addNonFungibleCollection?.(account, contract, tokenIds)

            for await (const tokenId of tokenIds) {
                await Token?.trustToken?.(account, {
                    id: `${contract.chainId}.${contract.address}.${tokenId}`,
                    chainId: contract.chainId,
                    type: TokenType.NonFungible,
                    schema: SchemaType.ERC721,
                    address: contract.address,
                    tokenId,
                })
            }

            showSnackbar(t('popups_wallet_collectible_added_successfully'), {
                variant: 'success',
            })
            navigate(`${PopupRoutes.Wallet}?tab=${WalletAssetTabs.Collectibles}`, { replace: true })
        },
        [account],
    )

    return (
        <TabContext value={currentTab}>
            <NormalHeader
                tabList={
                    <MaskTabList onChange={onChange} aria-label="persona-tabs" classes={{ root: classes.tabs }}>
                        <Tab label={t('popups_wallet_token')} value={TabType.Tokens} />
                        <Tab label={t('popups_wallet_collectible')} value={TabType.Collectibles} />
                    </MaskTabList>
                }
            />
            <div className={classes.content}>
                <SelectNetworkSidebar
                    className={classes.sidebar}
                    hideAllButton
                    chainId={chainId}
                    onChainChange={(chainId) => setChainId(chainId ?? ChainId.Mainnet)}
                    networks={allNetworks}
                    pluginID={NetworkPluginID.PLUGIN_EVM}
                />
                <div className={classes.main}>
                    <TabPanel className={classes.panel} value={TabType.Tokens}>
                        <FungibleTokenList
                            chainId={chainId}
                            isHiddenChainIcon={false}
                            mode={TokenListMode.Manage}
                            classes={{
                                channel: classes.channel,
                                listBox: classes.listBox,
                                searchInput: classes.searchInput,
                            }}
                            onSearchError={setSearchError}
                            blacklist={blackList.map((x) => x.address)}
                            FixedSizeListProps={{ height: 474, itemSize: rowSize + 16, className: classes.wrapper }}
                            SearchTextFieldProps={{ className: classes.input }}
                        />
                    </TabPanel>
                    <TabPanel className={classes.panel} value={TabType.Collectibles}>
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
