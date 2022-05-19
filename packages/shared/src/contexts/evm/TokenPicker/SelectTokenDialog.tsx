import { EMPTY_LIST, EnhanceableSite } from '@masknet/shared-base'
import { FungibleTokenList, useSharedI18N } from '@masknet/shared'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { ChainId, SchemaType, useTokenConstants } from '@masknet/web3-shared-evm'
// see https://github.com/import-js/eslint-plugin-import/issues/2288
// eslint-disable-next-line import/no-deprecated
import { DialogContent, Theme, useMediaQuery } from '@mui/material'
import type { FC } from 'react'
import { useBaseUIRuntime } from '../../base'
import { InjectedDialog } from '../../components'
import { useRowSize } from './useRowSize'
import type { FungibleToken } from '@masknet/web3-shared-base'

interface StyleProps {
    compact: boolean
    disablePaddingTop: boolean
}

const useStyles = makeStyles<StyleProps>()((theme, { compact, disablePaddingTop }) => ({
    content: {
        ...(compact ? { minWidth: 552 } : {}),
        padding: theme.spacing(3),
        paddingTop: disablePaddingTop ? 0 : theme.spacing(2.8),
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
        backgroundColor: 'transparent !important',
        border: `solid 1px ${MaskColorVar.twitterBorderLine}`,
    },
}))

export interface PickTokenOptions {
    disableNativeToken?: boolean
    chainId?: ChainId
    disableSearchBar?: boolean
    keyword?: string
    whitelist?: string[]
    title?: string
    blacklist?: string[]
    tokens?: FungibleToken<ChainId, SchemaType>[]
    selectedTokens?: string[]
}

export interface SelectTokenDialogProps extends PickTokenOptions {
    open: boolean
    onSelect?(token: FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>): void
    onClose?(): void
}

export const SelectTokenDialog: FC<SelectTokenDialogProps> = ({
    open,
    chainId,
    disableSearchBar,
    disableNativeToken,
    tokens,
    whitelist,
    blacklist = EMPTY_LIST,
    selectedTokens = EMPTY_LIST,
    onSelect,
    onClose,
    title,
}) => {
    const t = useSharedI18N()
    const isDashboard = location.href.includes('dashboard.html')
    const { networkIdentifier } = useBaseUIRuntime()
    const compact = networkIdentifier === EnhanceableSite.Minds
    const { classes } = useStyles({ compact, disablePaddingTop: isDashboard })
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants(chainId)
    // eslint-disable-next-line import/no-deprecated
    const isMdScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down('md'))

    const rowSize = useRowSize()

    return (
        <InjectedDialog
            titleBarIconStyle={isDashboard ? 'close' : 'back'}
            open={open}
            onClose={onClose}
            title={title ?? t.select_token()}>
            <DialogContent classes={{ root: classes.content }}>
                <FungibleTokenList
                    classes={{ list: classes.list, placeholder: classes.placeholder }}
                    onSelect={onSelect}
                    tokens={tokens ?? []}
                    whitelist={whitelist}
                    blacklist={
                        disableNativeToken && NATIVE_TOKEN_ADDRESS ? [NATIVE_TOKEN_ADDRESS, ...blacklist] : blacklist
                    }
                    chainId={chainId}
                    disableSearch={disableSearchBar}
                    selectedTokens={selectedTokens}
                    FixedSizeListProps={{
                        itemSize: rowSize,
                        height: isMdScreen ? 300 : 503,
                    }}
                    SearchTextFieldProps={{ InputProps: { classes: { root: classes.search } } }}
                />
            </DialogContent>
        </InjectedDialog>
    )
}
