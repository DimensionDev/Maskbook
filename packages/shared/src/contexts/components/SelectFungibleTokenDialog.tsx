import { useCallback, FC, useState, useMemo } from 'react'
import { useCurrentWeb3NetworkPluginID, useNativeTokenAddress } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { FungibleTokenList, useSharedI18N } from '@masknet/shared'
import { EMPTY_LIST, EnhanceableSite, isDashboardPage, NetworkPluginID } from '@masknet/shared-base'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import type { FungibleToken } from '@masknet/web3-shared-base'
import { DialogContent, Theme, useMediaQuery } from '@mui/material'
import { useBaseUIRuntime } from '../base/index.js'
import { InjectedDialog } from '../components/index.js'
import { useRowSize } from './useRowSize.js'
import { TokenListMode } from '../../UI/components/FungibleTokenList/type.js'

interface StyleProps {
    compact: boolean
    isDashboard: boolean
}

const useStyles = makeStyles<StyleProps>()((theme, { compact, isDashboard }) => ({
    content: {
        ...(compact ? { minWidth: 552 } : {}),
        padding: theme.spacing(2),
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        '-ms-overflow-style': 'none',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    list: {
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    placeholder: {
        textAlign: 'center',
        height: 288,
        paddingTop: theme.spacing(14),
        boxSizing: 'border-box',
    },
    search: {
        backgroundColor: isDashboard ? 'transparent !important' : theme.palette.maskColor.input,
        border: `solid 1px ${MaskColorVar.twitterBorderLine}`,
    },
    wrapper: {
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(6),
    },
}))

export interface SelectFungibleTokenDialogProps<T extends NetworkPluginID = NetworkPluginID> {
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
    onSubmit?(token: Web3Helper.FungibleTokenScope<'all'> | null): void
    onClose?(): void
}

const isDashboard = isDashboardPage()
export const SelectFungibleTokenDialog: FC<SelectFungibleTokenDialogProps> = ({
    open,
    pluginID,
    chainId,
    disableSearchBar,
    disableNativeToken,
    tokens,
    whitelist,
    blacklist = EMPTY_LIST,
    selectedTokens = EMPTY_LIST,
    onSubmit,
    onClose,
    title,
    enableManage = true,
}) => {
    const t = useSharedI18N()
    const { networkIdentifier } = useBaseUIRuntime()
    const compact = networkIdentifier === EnhanceableSite.Minds
    const pluginId = useCurrentWeb3NetworkPluginID(pluginID)
    const { classes } = useStyles({ compact, isDashboard })
    const isMdScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down('md'))

    const rowSize = useRowSize()
    const [currentModeRef, setCurrentModeRef] = useState<{
        updateMode(mode: TokenListMode): void
        getCurrentMode(): TokenListMode
    }>()

    const nativeTokenAddress = useNativeTokenAddress(pluginId)

    const onRefChange = useCallback(
        (node: { updateMode(mode: TokenListMode): void; getCurrentMode(): TokenListMode }) => {
            if (!node) return
            setCurrentModeRef(node)
        },
        [],
    )

    const FixedSizeListProps = useMemo(
        () => ({ itemSize: rowSize + 22, height: isMdScreen ? 300 : 428, className: classes.wrapper }),
        [rowSize, isMdScreen],
    )

    return (
        <InjectedDialog
            titleBarIconStyle={isDashboard ? 'close' : 'back'}
            open={open}
            onClose={() => {
                currentModeRef?.getCurrentMode() === TokenListMode.List
                    ? onClose?.()
                    : currentModeRef?.updateMode(TokenListMode.List)
            }}
            title={
                currentModeRef?.getCurrentMode() === TokenListMode.List
                    ? title ?? t.select_token()
                    : t.manage_token_list()
            }>
            <DialogContent classes={{ root: classes.content }}>
                <FungibleTokenList
                    ref={onRefChange}
                    pluginID={pluginId}
                    chainId={chainId}
                    tokens={tokens ?? []}
                    whitelist={whitelist}
                    enableManage={enableManage}
                    blacklist={
                        disableNativeToken && nativeTokenAddress ? [nativeTokenAddress, ...blacklist] : blacklist
                    }
                    disableSearch={disableSearchBar}
                    selectedTokens={selectedTokens}
                    onSelect={onSubmit}
                    FixedSizeListProps={FixedSizeListProps}
                    SearchTextFieldProps={{
                        InputProps: { classes: { root: classes.search } },
                    }}
                />
            </DialogContent>
        </InjectedDialog>
    )
}
