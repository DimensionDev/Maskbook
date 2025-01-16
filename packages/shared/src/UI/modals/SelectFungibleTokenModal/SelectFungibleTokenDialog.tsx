import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { EMPTY_LIST, EnhanceableSite, NetworkPluginID, Sniffings } from '@masknet/shared-base'
import { useRowSize } from '@masknet/shared-base-ui'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useNativeTokenAddress, useNetworkContext, useNetworks } from '@masknet/web3-hooks-base'
import type { FungibleToken } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { Button, DialogActions, DialogContent, inputClasses, useMediaQuery, type Theme } from '@mui/material'
import { useMemo, useState } from 'react'
import { TokenListMode } from '../../components/FungibleTokenList/type.js'
import { FungibleTokenList, SelectNetworkSidebar, type FungibleTokenListProps } from '../../components/index.js'
import { InjectedDialog, useBaseUIRuntime } from '../../contexts/index.js'

interface StyleProps {
    compact: boolean
}

const useStyles = makeStyles<StyleProps, 'container' | 'sidebar' | 'tokenList'>()((theme, { compact }, refs) => ({
    paddedContainer: {
        [`& .${refs.sidebar}`]: {
            paddingBottom: 72,
            overflow: 'auto',
            boxSizing: 'border-box',
        },
        [`& .${refs.tokenList}`]: {
            paddingBottom: 72,
            overflow: 'auto',
            height: '100%',
            boxSizing: 'border-box',
        },
    },
    container: {
        display: 'flex',
        flex: 1,
        width: '100%',
        gap: '16px',
        position: 'relative',
        minHeight: 0,
    },
    sidebar: {
        width: 27,
        minHeight: 0,
    },
    tokenList: {},
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
    dialogActions: {
        padding: 16,
        boxSizing: 'border-box',
        boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.05)',
        position: 'absolute',
        bottom: 0,
        width: '100%',
    },
}))

export interface SelectFungibleTokenDialogProps<T extends NetworkPluginID = NetworkPluginID>
    extends Pick<
        FungibleTokenListProps<T>,
        'extendTokens' | 'pluginID' | 'selectedTokens' | 'blacklist' | 'whitelist' | 'loading'
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
    onClose(token: Web3Helper.FungibleTokenAll | Web3Helper.FungibleTokenAll[] | null): void
    onChainChange?(chainId: Web3Helper.Definition[T]['ChainId']): void
    multiple?: boolean
    maxTokens?: number
}

export function SelectFungibleTokenDialog({
    open,
    pluginID,
    chainId,
    lockChainId = false,
    multiple,
    maxTokens,
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
    onClose,
    onChainChange,
}: SelectFungibleTokenDialogProps) {
    const { networkIdentifier } = useBaseUIRuntime()
    const [mode, setMode] = useState(multiple ? TokenListMode.Select : TokenListMode.List)
    const compact = networkIdentifier === EnhanceableSite.Minds
    const { pluginID: currentPluginID } = useNetworkContext(pluginID)
    const { classes, cx } = useStyles({ compact })
    const isMdScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down('md'))
    const allNetworks = useNetworks(NetworkPluginID.PLUGIN_EVM, true)
    const networks = useMemo(() => {
        if (!chains) return allNetworks
        return allNetworks.filter((network) => chains.includes(network.chainId))
    }, [chains, allNetworks])

    const rowSize = useRowSize()

    const nativeTokenAddress = useNativeTokenAddress(currentPluginID)

    const FixedSizeListProps = useMemo(
        () => ({ itemSize: rowSize + 18.5, height: 428, className: classes.wrapper }),
        [rowSize, isMdScreen, classes.wrapper],
    )
    const [pendingSelectedTokens, setPendingSelectedTokens] = useState(selectedTokens)
    const enabled = multiple && maxTokens ? pendingSelectedTokens.length < maxTokens : true
    const noChanges = useMemo(() => {
        const selectedSet = new Set(selectedTokens.map((x) => [x.chainId, x.address].join(':').toLowerCase()))
        const pendingSet = new Set(pendingSelectedTokens.map((x) => [x.chainId, x.address].join(':').toLowerCase()))
        return pendingSet.size === selectedSet.size && pendingSet.difference(selectedSet).size === 0
    }, [selectedTokens, pendingSelectedTokens])
    return (
        <InjectedDialog
            titleBarIconStyle={Sniffings.is_dashboard_page ? 'close' : 'back'}
            open={open}
            onClose={() => {
                if (mode === TokenListMode.Select || mode === TokenListMode.List) {
                    onClose(null)
                }
                // reset
                setMode(TokenListMode.List)
            }}
            title={
                title ? title
                : mode === TokenListMode.Manage ?
                    <Trans>Manage Token List</Trans>
                :   <Trans>Select</Trans>
            }
            titleTail={<Icons.Plus size={24} onClick={() => setMode(TokenListMode.Manage)} />}>
            <DialogContent classes={{ root: classes.content }}>
                <div className={cx(classes.container, mode === TokenListMode.Select ? classes.paddedContainer : null)}>
                    {!lockChainId && currentPluginID === NetworkPluginID.PLUGIN_EVM ?
                        <SelectNetworkSidebar
                            className={classes.sidebar}
                            hideAllButton
                            chainId={chainId}
                            onChainChange={(chainId) => onChainChange?.(chainId ?? ChainId.Mainnet)}
                            networks={networks}
                            pluginID={NetworkPluginID.PLUGIN_EVM}
                        />
                    :   null}
                    <FungibleTokenList
                        className={classes.tokenList}
                        mode={mode}
                        pluginID={currentPluginID}
                        chainId={chainId}
                        tokens={tokens ?? EMPTY_LIST}
                        extendTokens={extendTokens}
                        whitelist={whitelist}
                        blacklist={
                            disableNativeToken && nativeTokenAddress ? [nativeTokenAddress, ...blacklist] : blacklist
                        }
                        disableSearch={disableSearchBar}
                        loading={loading}
                        selectedChainId={selectedChainId}
                        selectedTokens={pendingSelectedTokens}
                        onSelectedChange={setPendingSelectedTokens}
                        onSelect={onClose}
                        FixedSizeListProps={FixedSizeListProps}
                        SearchTextFieldProps={{
                            InputProps: { classes: { root: classes.search } },
                        }}
                        isHiddenChainIcon={false}
                        enabled={enabled}
                    />
                </div>
            </DialogContent>
            {mode === TokenListMode.Select ?
                <DialogActions className={classes.dialogActions}>
                    <Button
                        variant="contained"
                        disabled={noChanges}
                        fullWidth
                        onClick={() => {
                            onClose(pendingSelectedTokens)
                        }}>
                        <Trans>Confirm</Trans>
                    </Button>
                </DialogActions>
            :   null}
        </InjectedDialog>
    )
}
