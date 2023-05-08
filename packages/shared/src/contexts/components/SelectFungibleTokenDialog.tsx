import { type FC, useState, useMemo } from 'react'
import {
    useNetworkContext,
    useNativeTokenAddress,
    useFungibleTokensFromTokenList,
    useFungibleAssets,
} from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { FungibleTokenList, useSharedI18N } from '@masknet/shared'
import { EMPTY_LIST, EnhanceableSite, isDashboardPage, type NetworkPluginID } from '@masknet/shared-base'
import { makeStyles, MaskColorVar, LoadingBase } from '@masknet/theme'
import type { FungibleToken } from '@masknet/web3-shared-base'

import { DialogContent, type Theme, useMediaQuery, Stack, Typography } from '@mui/material'
import { useBaseUIRuntime } from '../base/index.js'
import { InjectedDialog } from '../components/index.js'
import { useRowSize } from '../../hooks/useRowSize.js'
import { TokenListMode } from '../../UI/components/FungibleTokenList/type.js'

interface StyleProps {
    compact: boolean
}

const useStyles = makeStyles<StyleProps>()((theme, { compact }) => ({
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
        backgroundColor: isDashboardPage ? 'transparent !important' : theme.palette.maskColor.input,
        border: `solid 1px ${MaskColorVar.twitterBorderLine}`,
    },
    wrapper: {
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(6),
    },
    prompt: {
        marginTop: 13,
        fontSize: 14,
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
    onSubmit?(token: Web3Helper.FungibleTokenAll | null): void
    onClose?(): void
}

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
    const { pluginID: currentPluginID } = useNetworkContext(pluginID)
    const { classes } = useStyles({ compact })
    const isMdScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down('md'))

    const rowSize = useRowSize()
    const [mode, setMode] = useState(TokenListMode.List)

    const nativeTokenAddress = useNativeTokenAddress(currentPluginID)

    const { value: fungibleTokens = EMPTY_LIST, loading: loadingTokens } = useFungibleTokensFromTokenList(pluginID, {
        chainId,
    })

    const { value: fungibleAssets = EMPTY_LIST } = useFungibleAssets(pluginID, undefined, {
        chainId,
    })

    const FixedSizeListProps = useMemo(
        () => ({ itemSize: rowSize + 22, height: isMdScreen ? 300 : 428, className: classes.wrapper }),
        [rowSize, isMdScreen],
    )
    return (
        <InjectedDialog
            titleBarIconStyle={isDashboardPage ? 'close' : 'back'}
            open={open}
            onClose={() => {
                mode === TokenListMode.List ? onClose?.() : setMode(TokenListMode.List)
            }}
            title={title ? title : mode === TokenListMode.Manage ? t.manage_token_list() : t.select_token()}>
            <DialogContent classes={{ root: classes.content }}>
                {loadingTokens && mode !== TokenListMode.Manage ? (
                    <Stack
                        height={500}
                        width={'100%'}
                        justifyContent="center"
                        alignContent="center"
                        alignItems="center"
                        marginTop="18px"
                        marginBottom="48px">
                        <LoadingBase size={33} />
                        <Typography className={classes.prompt}>{t.loading()}</Typography>
                    </Stack>
                ) : (
                    <FungibleTokenList
                        mode={mode}
                        setMode={setMode}
                        pluginID={currentPluginID}
                        fungibleTokens={fungibleTokens}
                        fungibleAssets={fungibleAssets}
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
                )}
            </DialogContent>
        </InjectedDialog>
    )
}
