import { useCallback, useState } from 'react'
import { makeStyles, Theme, DialogContent, TextField } from '@material-ui/core'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { FixedTokenList, FixedTokenListProps } from '../../../extension/options-page/DashboardComponents/FixedTokenList'
import type { NativeTokenDetailed, ERC20TokenDetailed } from '../../../web3/types'
import { WalletMessages } from '../../Wallet/messages'
import { useNativeTokenDetailed } from '../../../web3/hooks/useNativeTokenDetailed'
import { delay, useRemoteControlledDialog, useI18N } from '../../../utils'

const useStyles = makeStyles((theme: Theme) => ({
    search: {
        width: '100%',
        margin: theme.spacing(1, 0, 2),
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
}))

export interface SelectTokenDialogProps extends withClasses<never> {}

export function SelectTokenDialog(props: SelectTokenDialogProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const [id, setId] = useState('')
    const [keyword, setKeyword] = useState('')

    //#region ether token
    const { value: etherTokenDetailed } = useNativeTokenDetailed()
    //#endregion

    //#region remote controlled dialog
    const [disableEther, setDisableEther] = useState(true)
    const [disableSearchBar, setDisableSearchBar] = useState(false)
    const [FixedTokenListProps, setFixedTokenListProps] = useState<FixedTokenListProps | null>(null)

    const { open, setDialog } = useRemoteControlledDialog(WalletMessages.events.selectTokenDialogUpdated, (ev) => {
        if (!ev.open) return
        setId(ev.uuid)
        setDisableEther(ev.disableEther ?? true)
        setDisableSearchBar(ev.disableSearchBar ?? false)
        setFixedTokenListProps(ev.FixedTokenListProps ?? null)
    })
    const onSubmit = useCallback(
        async (token: NativeTokenDetailed | ERC20TokenDetailed) => {
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

    return (
        <InjectedDialog
            open={open}
            onClose={onClose}
            title={t('plugin_wallet_select_a_token')}
            DialogProps={{ maxWidth: 'xs' }}>
            <DialogContent>
                {!disableSearchBar ? (
                    <TextField
                        className={classes.search}
                        label={t('add_token_search_hint')}
                        autoFocus
                        fullWidth
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                ) : null}
                <FixedTokenList
                    classes={{ list: classes.list, placeholder: classes.placeholder }}
                    keyword={keyword}
                    onSubmit={onSubmit}
                    {...{
                        ...FixedTokenListProps,
                        tokens: [
                            ...(!disableEther &&
                            etherTokenDetailed &&
                            (!keyword || 'ether'.includes(keyword.toLowerCase()))
                                ? [etherTokenDetailed]
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
