import { memo, useEffect, useRef, useState } from 'react'
import { MaskTabList, makeStyles, useTabs } from '@masknet/theme'
import { FungibleTokenList, type FungibleTokenListProps, SelectNetworkSidebar, TokenListMode } from '@masknet/shared'
import { useRowSize } from '@masknet/shared-base-ui'
import { useBlockedFungibleTokens } from '@masknet/web3-hooks-base'
import { useI18N } from '../../../../../utils/index.js'
import { useTitle } from '../../../hook/useTitle.js'
import { ChainId } from '@masknet/web3-shared-evm'
import { Tab } from '@mui/material'
import { TabContext, TabPanel } from '@mui/lab'
import { NormalHeader } from '../../../components/index.js'
import { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useIntersectionObserver } from '@react-hookz/web'
import { useParams } from 'react-router-dom'

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
        marginTop: currentTab === TabType.Token ? 42 : 0,
    },
}))

enum TabType {
    Token = 'Token',
    NFT = 'NFT',
}

const SupportedChains = [
    ChainId.Mainnet,
    ChainId.BSC,
    ChainId.Matic,
    ChainId.Arbitrum,
    ChainId.Optimism,
    ChainId.Avalanche,
    ChainId.xDai,
]

const AddToken = memo(function AddToken() {
    const { t } = useI18N()

    const blackList = useBlockedFungibleTokens()
    const rowSize = useRowSize()
    const { chainId: chainId_ } = useParams()

    const [currentTab, onChange] = useTabs(TabType.Token, TabType.Token, TabType.NFT)
    const { classes } = useStyles({ currentTab })

    const [chainId, setChainId] = useState<Web3Helper.ChainIdAll>(chainId_ ? Number(chainId_) : ChainId.Mainnet)

    useTitle(t('add_assets'))

    return (
        <TabContext value={currentTab}>
            <NormalHeader
                tabList={
                    <MaskTabList onChange={onChange} aria-label="persona-tabs" classes={{ root: classes.tabs }}>
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
                        supportedChains={SupportedChains}
                        pluginID={NetworkPluginID.PLUGIN_EVM}
                    />
                </div>
                <div className={classes.main}>
                    <TabPanel className={classes.panel} value={TabType.Token}>
                        <FungibleTokenListItem
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
                        123
                    </TabPanel>
                </div>
            </div>
        </TabContext>
    )
})

function FungibleTokenListItem<T extends NetworkPluginID>(props: FungibleTokenListProps<T>) {
    const ref = useRef<HTMLDivElement | null>(null)
    const entry = useIntersectionObserver(ref, {})
    const [isViewed, setIsViewed] = useState(false)

    useEffect(() => {
        if (entry?.isIntersecting && entry?.intersectionRatio > 0) setIsViewed(true)
    }, [entry?.isIntersecting])

    return <div ref={ref}>{isViewed ? <FungibleTokenList {...props} /> : null}</div>
}

export default AddToken
