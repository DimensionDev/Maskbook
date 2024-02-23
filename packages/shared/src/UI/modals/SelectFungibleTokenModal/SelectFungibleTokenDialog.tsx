import { useState, useMemo } from 'react'
import { DialogContent, type Theme, useMediaQuery, inputClasses } from '@mui/material'
import { useNetworkContext, useNativeTokenAddress, useNetworks } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { EMPTY_LIST, EnhanceableSite, NetworkPluginID, Sniffings } from '@masknet/shared-base'
import { useRowSize } from '@masknet/shared-base-ui'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import type { FungibleToken } from '@masknet/web3-shared-base'
import { TokenListMode } from '../../components/FungibleTokenList/type.js'
import { useSharedTrans } from '../../../locales/index.js'
import { InjectedDialog, useBaseUIRuntime } from '../../contexts/index.js'
import { FungibleTokenList, SelectNetworkSidebar } from '../../components/index.js'
import { ChainId } from '@masknet/web3-shared-evm'

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
    pluginID?: T
    chainId?: Web3Helper.Definition[T]['ChainId']
    keyword?: string
    whitelist?: string[]
    title?: string
    blacklist?: string[]
    tokens?: Array<FungibleToken<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>>
    disableSearchBar?: boolean
    disableNativeToken?: boolean
    selectedTokens?: string[]
    onClose(token: Web3Helper.FungibleTokenAll | null): void
    setChainId(chainId: Web3Helper.Definition[T]['ChainId']): void
}

export function SelectFungibleTokenDialog({
    open,
    pluginID,
    chainId,
    disableSearchBar,
    disableNativeToken,
    tokens,
    whitelist,
    blacklist = EMPTY_LIST,
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
    const { pluginID: currentPluginID } = useNetworkContext(pluginID)
    const { classes } = useStyles({ compact, isList: mode === TokenListMode.List })
    const isMdScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down('md'))
    const allNetworks = useNetworks(NetworkPluginID.PLUGIN_EVM, true)

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
                        networks={allNetworks}
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
