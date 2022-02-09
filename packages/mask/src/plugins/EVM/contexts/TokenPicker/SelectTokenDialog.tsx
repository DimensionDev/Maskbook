import { ERC20TokenList } from '@masknet/shared'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { ChainId, FungibleTokenDetailed, useTokenConstants } from '@masknet/web3-shared-evm'
// see https://github.com/import-js/eslint-plugin-import/issues/2288
// eslint-disable-next-line import/no-deprecated
import { DialogContent, Theme, useMediaQuery } from '@mui/material'
import type { FC } from 'react'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'
import { activatedSocialNetworkUI } from '../../../../social-network'
import { MINDS_ID } from '../../../../social-network-adaptor/minds.com/base'
import { useI18N } from '../../../../utils'
import { useRowSize } from './useRowSize'

interface StyleProps {
    snsId: string
    isDashboard: boolean
}

const useStyles = makeStyles<StyleProps>()((theme, { snsId, isDashboard }) => ({
    content: {
        ...(snsId === MINDS_ID ? { minWidth: 552 } : {}),
        padding: theme.spacing(3),
        paddingTop: isDashboard ? 0 : theme.spacing(2.8),
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
    blacklist?: string[]
    tokens?: FungibleTokenDetailed[]
    selectedTokens?: string[]
}

export interface SelectTokenDialogProps extends PickTokenOptions {
    open: boolean
    onSelect?(token: FungibleTokenDetailed): void
    onClose?(): void
}

export const SelectTokenDialog: FC<SelectTokenDialogProps> = ({
    open,
    chainId,
    disableSearchBar,
    disableNativeToken,
    tokens,
    blacklist,
    onSelect,
    onClose,
}) => {
    const { t } = useI18N()
    const isDashboard = location.href.includes('dashboard.html')
    const { classes } = useStyles({ snsId: activatedSocialNetworkUI.networkIdentifier, isDashboard })
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants(chainId)
    // eslint-disable-next-line import/no-deprecated
    const isMdScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down('md'))

    const rowSize = useRowSize()

    return (
        <InjectedDialog
            titleBarIconStyle={isDashboard ? 'close' : 'back'}
            open={open}
            onClose={onClose}
            title={t('plugin_wallet_select_a_token')}>
            <DialogContent classes={{ root: classes.content }}>
                <ERC20TokenList
                    classes={{ list: classes.list, placeholder: classes.placeholder }}
                    onSelect={onSelect}
                    tokens={tokens ?? []}
                    blacklist={
                        disableNativeToken && NATIVE_TOKEN_ADDRESS
                            ? [NATIVE_TOKEN_ADDRESS, ...(blacklist ?? [])]
                            : blacklist ?? []
                    }
                    targetChainId={chainId}
                    disableSearch={disableSearchBar}
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
