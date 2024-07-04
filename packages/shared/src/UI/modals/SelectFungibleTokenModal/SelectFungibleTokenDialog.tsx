import { EMPTY_LIST, EnhanceableSite, NetworkPluginID, type PluginID, Sniffings } from '@masknet/shared-base'
import { useRowSize } from '@masknet/shared-base-ui'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useNativeTokenAddress, useNetworkContext, useNetworks } from '@masknet/web3-hooks-base'
import type { FungibleToken } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { DialogContent, inputClasses, type Theme, useMediaQuery } from '@mui/material'
import { useMemo, useState } from 'react'
import { useSharedTrans } from '../../../locales/index.js'
import { TokenListMode } from '../../components/FungibleTokenList/type.js'
import { FungibleTokenList, SelectNetworkSidebar } from '../../components/index.js'
import { InjectedDialog, useBaseUIRuntime } from '../../contexts/index.js'
import { useActivatedPluginSiteAdaptor } from '@masknet/plugin-infra/content-script'

interface StyleProps {
    compact: boolean
    isList: boolean
}

const useStyles = makeStyles<StyleProps>()((theme, { compact, isList }) => ({
    container: {
        display: 'flex',
        flex: 1,
        width: '100%',
        gap: '16px',
        position: 'relative',
    },
    sidebarContainer: {
        width: 27,
        height: isList ? 486 : undefined,
    },
    content: {
        ...(compact ? { minWidth: 552 } : {}),
        padding: theme.spacing(2),
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    search: {
        backgroundColor: Sniffings.is_dashboard_page ? 'transparent !important' : theme.palette.maskColor.input,
        border: `solid 1px ${MaskColorVar.twitterBorderLine}`,
        [`&.${inputClasses.focused}`]: {
            background: theme.palette.maskColor.bottom,
        },
    },
    wrapper: {
        paddingBottom: theme.spacing(6),
    },
}))

interface SelectFungibleTokenDialogProps<T extends NetworkPluginID = NetworkPluginID> {
    open: boolean
    enableManage?: boolean
    /** NetworkPluginID, blockchain runtime */
    runtime?: T
    pluginID?: PluginID
    chainId?: Web3Helper.Definition[T]['ChainId']
    keyword?: string
    whitelist?: string[]
    title?: string
    blacklist?: string[]
    tokens?: Array<FungibleToken<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>>
    disableSearchBar?: boolean
    disableNativeToken?: boolean
    selectedChainId?: Web3Helper.Definition[T]['ChainId']
    selectedTokens?: string[]
    onClose(token: Web3Helper.FungibleTokenAll | null): void
    setChainId(chainId: Web3Helper.Definition[T]['ChainId']): void
}

export function SelectFungibleTokenDialog({
    open,
    runtime,
    pluginID,
    chainId,
    disableSearchBar,
    disableNativeToken,
    tokens,
    whitelist,
    blacklist = EMPTY_LIST,
    selectedChainId,
    selectedTokens = EMPTY_LIST,
    title,
    enableManage = true,
    onClose,
    setChainId,
}: SelectFungibleTokenDialogProps) {
    const t = useSharedTrans()
    const { networkIdentifier } = useBaseUIRuntime()
    const [mode, setMode] = useState(TokenListMode.List)
    const compact = networkIdentifier === EnhanceableSite.Minds
    const { pluginID: currentPluginID } = useNetworkContext(runtime)
    const { classes } = useStyles({ compact, isList: mode === TokenListMode.List })
    const isMdScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down('md'))
    const allNetworks = useNetworks(NetworkPluginID.PLUGIN_EVM, true)
    const plugin = useActivatedPluginSiteAdaptor(pluginID, 'any')

    const networks = useMemo(() => {
        if (!plugin || !runtime) return allNetworks
        const supportedChainIds = plugin.enableRequirement.web3?.[runtime]?.supportedChainIds
        if (!supportedChainIds) return allNetworks
        return allNetworks.filter((x) => supportedChainIds.includes(x.chainId))
    }, [plugin, allNetworks])

    const rowSize = useRowSize()

    const nativeTokenAddress = useNativeTokenAddress(currentPluginID)

    const FixedSizeListProps = useMemo(
        () => ({ itemSize: rowSize + 18.5, height: isMdScreen ? 300 : 428, className: classes.wrapper }),
        [rowSize, isMdScreen],
    )
    return (
        <InjectedDialog
            titleBarIconStyle={Sniffings.is_dashboard_page ? 'close' : 'back'}
            open={open}
            onClose={() => {
                mode === TokenListMode.List ? onClose(null) : setMode(TokenListMode.List)
            }}
            title={
                title ? title
                : mode === TokenListMode.Manage ?
                    t.manage_token_list()
                :   t.select_token()
            }>
            <DialogContent classes={{ root: classes.content }}>
                <div className={classes.container}>
                    <SelectNetworkSidebar
                        className={classes.sidebarContainer}
                        hideAllButton
                        chainId={chainId}
                        onChainChange={(chainId) => setChainId(chainId ?? ChainId.Mainnet)}
                        networks={networks}
                        pluginID={NetworkPluginID.PLUGIN_EVM}
                    />
                    <FungibleTokenList
                        mode={mode}
                        setMode={setMode}
                        pluginID={currentPluginID}
                        chainId={chainId}
                        tokens={tokens ?? EMPTY_LIST}
                        whitelist={whitelist}
                        enableManage={enableManage}
                        blacklist={
                            disableNativeToken && nativeTokenAddress ? [nativeTokenAddress, ...blacklist] : blacklist
                        }
                        disableSearch={disableSearchBar}
                        selectedChainId={selectedChainId}
                        selectedTokens={selectedTokens}
                        onSelect={onClose}
                        FixedSizeListProps={FixedSizeListProps}
                        SearchTextFieldProps={{
                            InputProps: { classes: { root: classes.search } },
                        }}
                        isHiddenChainIcon={false}
                    />
                </div>
            </DialogContent>
        </InjectedDialog>
    )
}
