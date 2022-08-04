import type { FC } from 'react'
import { useRef } from 'react'
import { useCurrentWeb3NetworkPluginID, useNativeTokenAddress, Web3Helper } from '@masknet/plugin-infra/web3'
import { FungibleTokenList, useSharedI18N } from '@masknet/shared'
import { EMPTY_LIST, EnhanceableSite, isDashboardPage } from '@masknet/shared-base'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import type { FungibleToken, NetworkPluginID } from '@masknet/web3-shared-base'
import { DialogContent, Theme, useMediaQuery } from '@mui/material'
import { useBaseUIRuntime } from '../base'
import { InjectedDialog } from '../components'
import { useRowSize } from './useRowSize'
import { TokenListMode } from '../../UI/components/FungibleTokenList/type'

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
}) => {
    const t = useSharedI18N()
    const { networkIdentifier } = useBaseUIRuntime()
    const compact = networkIdentifier === EnhanceableSite.Minds
    const pluginId = useCurrentWeb3NetworkPluginID(pluginID)
    const { classes } = useStyles({ compact, isDashboard })
    const isMdScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down('md'))

    const rowSize = useRowSize()

    const nativeTokenAddress = useNativeTokenAddress(pluginId)

    const modeRef = useRef<{
        updateMode(mode: TokenListMode): void
        getCurrentMode(): TokenListMode
    }>(null)

    return (
        <InjectedDialog
            titleBarIconStyle={isDashboard ? 'close' : 'back'}
            open={open}
            onClose={() => {
                modeRef?.current?.getCurrentMode() === TokenListMode.List
                    ? onClose?.()
                    : modeRef?.current?.updateMode(TokenListMode.List)
            }}
            title={title ?? t.select_token()}>
            <DialogContent classes={{ root: classes.content }}>
                <FungibleTokenList
                    ref={modeRef}
                    classes={{ list: classes.list, placeholder: classes.placeholder }}
                    pluginID={pluginId}
                    chainId={chainId}
                    tokens={tokens ?? []}
                    whitelist={whitelist}
                    blacklist={
                        disableNativeToken && nativeTokenAddress ? [nativeTokenAddress, ...blacklist] : blacklist
                    }
                    disableSearch={disableSearchBar}
                    selectedTokens={selectedTokens}
                    onSelect={onSubmit}
                    FixedSizeListProps={{
                        itemSize: rowSize + 16,
                        height: isMdScreen ? 300 : 422,
                        className: classes.wrapper,
                    }}
                    SearchTextFieldProps={{
                        InputProps: { classes: { root: classes.search } },
                    }}
                />
            </DialogContent>
        </InjectedDialog>
    )
}
