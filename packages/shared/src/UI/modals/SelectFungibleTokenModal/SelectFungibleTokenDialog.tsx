import { EMPTY_LIST, EnhanceableSite, NetworkPluginID, Sniffings } from '@masknet/shared-base'
import { useRowSize } from '@masknet/shared-base-ui'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useNativeTokenAddress, useNetworkContext, useNetworks } from '@masknet/web3-hooks-base'
import type { FungibleToken } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { DialogContent, inputClasses, useMediaQuery, type Theme } from '@mui/material'
import { useMemo, useState } from 'react'
import { TokenListMode } from '../../components/FungibleTokenList/type.js'
import { FungibleTokenList, SelectNetworkSidebar, type FungibleTokenListProps } from '../../components/index.js'
import { InjectedDialog, useBaseUIRuntime } from '../../contexts/index.js'
import { Trans } from '@lingui/macro'

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

export interface SelectFungibleTokenDialogProps<T extends NetworkPluginID = NetworkPluginID>
    extends Pick<
        FungibleTokenListProps<T>,
        'extendTokens' | 'pluginID' | 'enableManage' | 'selectedTokens' | 'blacklist' | 'whitelist' | 'loading'
    > {
    open: boolean
    chainId?: Web3Helper.Definition[T]['ChainId']
    /** Do not allow to select other chains */
    lockChainId?: boolean
    keyword?: string
    title?: string
    tokens?: Array<FungibleToken<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>>
    /** ChainIds of allowed chains */
    chains?: ChainId[]
    disableSearchBar?: boolean
    disableNativeToken?: boolean
    selectedChainId?: Web3Helper.Definition[T]['ChainId']
    onClose(token: Web3Helper.FungibleTokenAll | null): void
    onChainChange?(chainId: Web3Helper.Definition[T]['ChainId']): void
}

export function SelectFungibleTokenDialog({
    open,
    pluginID,
    chainId,
    lockChainId = false,
    disableSearchBar,
    loading,
    disableNativeToken,
    tokens,
    extendTokens,
    chains,
    whitelist,
    blacklist = EMPTY_LIST,
    selectedChainId,
    selectedTokens = EMPTY_LIST,
    title,
    enableManage = true,
    onClose,
    onChainChange,
}: SelectFungibleTokenDialogProps) {
    const { networkIdentifier } = useBaseUIRuntime()
    const [mode, setMode] = useState(TokenListMode.List)
    const compact = networkIdentifier === EnhanceableSite.Minds
    const { pluginID: currentPluginID } = useNetworkContext(pluginID)
    const { classes } = useStyles({ compact, isList: mode === TokenListMode.List })
    const isMdScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down('md'))
    const allNetworks = useNetworks(NetworkPluginID.PLUGIN_EVM, true)
    const networks = useMemo(() => {
        if (!chains) return allNetworks
        return allNetworks.filter((network) => chains.includes(network.chainId))
    }, [chains, allNetworks])

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
                    <Trans>Manage Token List</Trans>
                :   <Trans>Select</Trans>
            }>
            <DialogContent classes={{ root: classes.content }}>
                <div className={classes.container}>
                    {!lockChainId ?
                        <SelectNetworkSidebar
                            className={classes.sidebarContainer}
                            hideAllButton
                            chainId={chainId}
                            onChainChange={(chainId) => onChainChange?.(chainId ?? ChainId.Mainnet)}
                            networks={networks}
                            pluginID={NetworkPluginID.PLUGIN_EVM}
                        />
                    :   null}
                    <FungibleTokenList
                        mode={mode}
                        setMode={setMode}
                        pluginID={currentPluginID}
                        chainId={chainId}
                        tokens={tokens ?? EMPTY_LIST}
                        extendTokens={extendTokens}
                        whitelist={whitelist}
                        enableManage={enableManage}
                        blacklist={
                            disableNativeToken && nativeTokenAddress ? [nativeTokenAddress, ...blacklist] : blacklist
                        }
                        disableSearch={disableSearchBar}
                        loading={loading}
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
