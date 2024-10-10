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
import { ChainId, type SchemaType } from '@masknet/web3-shared-evm'
import { TabContext, TabPanel } from '@mui/lab'
import { Tab } from '@mui/material'
import { NormalHeader } from '../../../components/index.js'
import { useTitle } from '../../../hooks/index.js'
import { WalletAssetTabs } from '../type.js'
import { msg, Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'

const useStyles = makeStyles<{ searchError: boolean }>()((theme, { searchError }) => ({
    content: {
        flex: 1,
        padding: '0 0 0 16px',
        display: 'flex',
        overflow: 'hidden',
    },
    channel: {
        flex: 1,
        paddingTop: theme.spacing(2),
        '& > div': {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
        },
    },
    listBox: {
        flex: 1,
        marginTop: searchError ? 18 : 0,
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    wrapper: {
        padding: theme.spacing(0, 2, 0, 1.5),
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
        padding: 0,
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
        marginRight: theme.spacing(2),
        marginLeft: theme.spacing(1.5),
        paddingBottom: theme.spacing(2),
    },
    sidebar: {
        height: 432,
        paddingTop: theme.spacing(2),
    },
    grid: {
        gridTemplateColumns: 'repeat(auto-fill, minmax(40%, 1fr))',
    },
    form: {
        padding: theme.spacing(2, 2, 0, 1.5),
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

export const Component = memo(function AddToken() {
    const { _ } = useLingui()

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
    const { classes } = useStyles({ searchError })
    const allNetworks = useNetworks(NetworkPluginID.PLUGIN_EVM, true)

    const supportedChains = allNetworks.map((x) => x.chainId)
    const [chainId, setChainId] = useState<Web3Helper.ChainIdAll>(
        defaultChainId && supportedChains.includes(Number.parseInt(defaultChainId, 10)) ?
            Number.parseInt(defaultChainId, 10)
        :   ChainId.Mainnet,
    )

    useTitle(_(msg`Add Assets`))

    const { Token } = useWeb3State(NetworkPluginID.PLUGIN_EVM)

    const { showSnackbar } = usePopupCustomSnackbar()

    const [{ loading: loadingAddCustomNFTs }, addCustomNFTs] = useAsyncFn(
        async (result: [contract: NonFungibleTokenContract<ChainId, SchemaType>, tokenIds: string[]]) => {
            const [contract, tokenIds] = result
            await Token?.addNonFungibleTokens?.(account, contract, tokenIds)

            for await (const tokenId of tokenIds) {
                await Token?.addToken?.(account, {
                    id: `${contract.chainId}.${contract.address}.${tokenId}`,
                    chainId: contract.chainId,
                    tokenId,
                    type: TokenType.NonFungible,
                    schema: contract.schema,
                    address: contract.address,
                })
            }

            showSnackbar(<Trans>NFTs added</Trans>, {
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
                        <Tab label={<Trans>Tokens</Trans>} value={TabType.Tokens} />
                        <Tab label={<Trans>NFTs</Trans>} value={TabType.Collectibles} />
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
                            FixedSizeListProps={{ height: 444, itemSize: rowSize + 16, className: classes.wrapper }}
                            SearchTextFieldProps={{ className: classes.input }}
                        />
                    </TabPanel>
                    <TabPanel className={classes.panel} value={TabType.Collectibles}>
                        <AddCollectibles
                            pluginID={NetworkPluginID.PLUGIN_EVM}
                            chainId={chainId}
                            onAdd={addCustomNFTs}
                            disabled={loadingAddCustomNFTs}
                            classes={{ grid: classes.grid, form: classes.form, main: classes.nftContent }}
                        />
                    </TabPanel>
                </div>
            </div>
        </TabContext>
    )
})
