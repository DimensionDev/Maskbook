import { useCallback, useState } from 'react'
import { DialogContent } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { FungibleTokenDetailed, useNativeTokenDetailed, useChainDetailed } from '@masknet/web3-shared'
import { InjectedDialog, useRemoteControlledDialog, useStylesExtends } from '@masknet/shared'
import { FixedTokenList, FixedTokenListProps } from '../../../extension/options-page/DashboardComponents/FixedTokenList'
import { WalletMessages } from '../../Wallet/messages'
import { delay, useI18N } from '../../../utils'
import { SearchInput } from '../../../extension/options-page/DashboardComponents/SearchInput'

const useStyles = makeStyles()((theme) => ({
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
}))

export interface SelectTokenDialogProps extends withClasses<never> {}

export function SelectTokenDialog(props: SelectTokenDialogProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const [id, setId] = useState('')
    const [keyword, setKeyword] = useState('')
    const chainDetailed = useChainDetailed()

    //#region the native token
    const { value: nativeTokenDetailed } = useNativeTokenDetailed()
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
        <InjectedDialog open={open} onClose={onClose} title={'xxxx'} maxWidth="xs">
            <DialogContent>
                {!disableSearchBar ? <SearchInput label={t('add_token_search_hint')} onChange={onChange} /> : null}
                <FixedTokenList
                    classes={{ list: classes.list, placeholder: classes.placeholder }}
                    keyword={keyword}
                    onSelect={onSubmit}
                    {...{
                        ...FixedTokenListProps,
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
