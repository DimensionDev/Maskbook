import { memo, useMemo } from 'react'
import { MaskTabList, makeStyles, useTabs } from '@masknet/theme'
import { FungibleTokenList, TokenListMode } from '@masknet/shared'
import { useRowSize } from '@masknet/shared-base-ui'
import { useBlockedFungibleTokens, useNetworkDescriptors } from '@masknet/web3-hooks-base'
import { useI18N } from '../../../../../utils/index.js'
import { useTitle } from '../../../hook/useTitle.js'
import { ChainId } from '@masknet/web3-shared-evm'
import { Tab } from '@mui/material'
import { TabContext, TabPanel } from '@mui/lab'
import { NormalHeader } from '../../../components/index.js'
import { NetworkPluginID } from '@masknet/shared-base'
import { sortBy } from 'lodash-es'

const useStyles = makeStyles()((theme) => ({
    content: {
        flex: 1,
        padding: '16px 16px 0 16px',
        display: 'flex',
        flexDirection: 'column',
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
    },
    wrapper: {
        height: '474px!important',
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
    const { classes } = useStyles()
    const blackList = useBlockedFungibleTokens()
    const rowSize = useRowSize()

    const [currentTab, onChange] = useTabs(TabType.Token, TabType.Token, TabType.NFT)

    const allNetworks = useNetworkDescriptors(NetworkPluginID.PLUGIN_EVM)
    const networks = useMemo(() => {
        return sortBy(
            allNetworks.filter((x) => x.isMainnet && SupportedChains.includes(x.chainId)),
            (x) => SupportedChains.indexOf(x.chainId),
        )
    }, [allNetworks])

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
                <TabPanel className={classes.panel} value={TabType.Token}>
                    <FungibleTokenList
                        chainId={ChainId.Matic}
                        isHiddenChainIcon={false}
                        mode={TokenListMode.Manage}
                        classes={{ channel: classes.channel, listBox: classes.listBox }}
                        blacklist={blackList.map((x) => x.address)}
                        FixedSizeListProps={{ height: 340, itemSize: rowSize + 16, className: classes.wrapper }}
                        SearchTextFieldProps={{ className: classes.input }}
                    />
                </TabPanel>
                <TabPanel className={classes.panel} value={TabType.NFT}>
                    123
                </TabPanel>
            </div>
        </TabContext>
    )
})

export default AddToken
