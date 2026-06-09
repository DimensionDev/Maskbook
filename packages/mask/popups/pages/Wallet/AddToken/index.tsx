import { useLingui } from '@lingui/react/macro'
import { FungibleTokenList, SelectNetworkSidebar, TokenListMode } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { useRowSize } from '@masknet/shared-base-ui'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useBlockedFungibleTokens, useChainContext, useNetworks, usePrivyWallet } from '@masknet/web3-hooks-base'
import { PRIVY_SUPPORTED_CHAINS } from '@masknet/web3-providers'
import { ChainId } from '@masknet/web3-shared-evm'
import { memo, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { NormalHeader } from '../../../components/index.js'
import { useTitle } from '../../../hooks/index.js'

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
}))

export const Component = memo(function AddToken() {
    const { t } = useLingui()

    const blackList = useBlockedFungibleTokens()
    const rowSize = useRowSize()
    const navigate = useNavigate()
    const { chainId: defaultChainId } = useParams()
    const { account } = useChainContext()
    const [searchError, setSearchError] = useState(false)
    const { classes } = useStyles({ searchError })
    const allNetworks = useNetworks(NetworkPluginID.PLUGIN_EVM, true)

    const isPrivyWallet = !!usePrivyWallet(account)
    const filteredNetworks = useMemo(() => {
        return isPrivyWallet ? allNetworks.filter((x) => PRIVY_SUPPORTED_CHAINS.includes(x.chainId)) : allNetworks
    }, [allNetworks, isPrivyWallet])

    const supportedChains = filteredNetworks.map((x) => x.chainId)
    const [chainId, setChainId] = useState<Web3Helper.ChainIdAll>(
        defaultChainId && supportedChains.includes(Number.parseInt(defaultChainId, 10)) ?
            Number.parseInt(defaultChainId, 10)
        :   ChainId.Mainnet,
    )

    useTitle(t`Add Assets`)

    return (
        <>
            <NormalHeader />
            <div className={classes.content}>
                <SelectNetworkSidebar
                    className={classes.sidebar}
                    chainId={chainId}
                    onChainChange={(chainId) => setChainId(chainId ?? ChainId.Mainnet)}
                    networks={filteredNetworks}
                    pluginID={NetworkPluginID.PLUGIN_EVM}
                />
                <div className={classes.main}>
                    <div className={classes.panel}>
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
                    </div>
                </div>
            </div>
        </>
    )
})
