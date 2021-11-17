import { useCallback, useMemo, useState } from 'react'
import { DialogContent } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import {
    FungibleTokenDetailed,
    useNativeTokenDetailed,
    useChainId,
    ChainId,
    getChainDetailed,
} from '@masknet/web3-shared-evm'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { FixedTokenList, FixedTokenListProps } from '../../../extension/options-page/DashboardComponents/FixedTokenList'
import { WalletMessages } from '../../Wallet/messages'
import { delay, useI18N } from '../../../utils'
import { useRemoteControlledDialog, useStylesExtends } from '@masknet/shared'
import { SearchInput } from '../../../extension/options-page/DashboardComponents/SearchInput'
import { MINDS_ID } from '../../../social-network-adaptor/minds.com/base'
import { activatedSocialNetworkUI } from '../../../social-network'

interface StyleProps {
    snsId: string
}

const useStyles = makeStyles<StyleProps>()((theme, { snsId }) => ({
    content: {
        ...(snsId === MINDS_ID ? { minWidth: 552 } : {}),
    },
    list: {
        marginTop: 16,
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
}))

export interface SelectTokenDialogProps extends withClasses<never> {}

export function SelectTokenDialog(props: SelectTokenDialogProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles({ snsId: activatedSocialNetworkUI.networkIdentifier }), props)
    const chainId = useChainId()
    const [id, setId] = useState('')
    const [keyword, setKeyword] = useState('')
    const [targetChainId, setChainId] = useState<ChainId | undefined>(chainId)

    const chainDetailed = useMemo(() => getChainDetailed(targetChainId), [targetChainId])

    //#region the native token
    const { value: nativeTokenDetailed } = useNativeTokenDetailed(targetChainId)
    //#endregion

    //#region remote controlled dialog
    const [disableNativeToken, setDisableNativeToken] = useState(true)
    const [disableSearchBar, setDisableSearchBar] = useState(false)
    const [FixedTokenListProps, setFixedTokenListProps] = useState<FixedTokenListProps | null>(null)

    const { open, setDialog } = useRemoteControlledDialog(WalletMessages.events.selectTokenDialogUpdated, (ev) => {
        if (!ev.open) return
        setId(ev.uuid)
        setDisableNativeToken(ev.disableNativeToken ?? true)
        setDisableSearchBar(ev.disableSearchBar ?? false)
        setFixedTokenListProps(ev.FixedTokenListProps ?? null)
        setChainId(ev.chainId ?? undefined)
    })
    const onSubmit = useCallback(
        async (token: FungibleTokenDetailed) => {
            setDialog({
                open: false,
                uuid: id,
                token,
            })
            await delay(300)
            setKeyword('')
        },
        [id, setDialog, setKeyword],
    )
    const onClose = useCallback(async () => {
        setDialog({
            open: false,
            uuid: id,
        })
        await delay(300)
        setKeyword('')
    }, [id, setDialog])
    //#endregion

    const onChange = useCallback((keyword: string) => {
        setKeyword(keyword)
    }, [])

    return (
        <InjectedDialog open={open} onClose={onClose} title={t('plugin_wallet_select_a_token')}>
            <DialogContent className={classes.content}>
                {!disableSearchBar ? <SearchInput label={t('add_token_search_hint')} onChange={onChange} /> : null}
                <FixedTokenList
                    classes={{ list: classes.list, placeholder: classes.placeholder }}
                    keyword={keyword}
                    onSelect={onSubmit}
                    {...{
                        ...FixedTokenListProps,
                        targetChainId,
                        tokens: [
                            ...(!disableNativeToken &&
                            nativeTokenDetailed &&
                            (!keyword || chainDetailed?.nativeCurrency.symbol.includes(keyword.toLowerCase()))
                                ? [nativeTokenDetailed]
                                : []),
                            ...(FixedTokenListProps?.tokens ?? []),
                        ],
                    }}
                    FixedSizeListProps={{
                        height: disableSearchBar ? 350 : 288,
                        itemSize: 52,
                        overscanCount: 4,
                        ...FixedTokenListProps?.FixedSizeListProps,
                    }}
                />
            </DialogContent>
        </InjectedDialog>
    )
}
