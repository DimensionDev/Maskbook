import { useCallback, useState } from 'react'
import { makeStyles, Theme, DialogContent, Paper, IconButton, InputBase, Typography } from '@material-ui/core'
import { FungibleTokenDetailed, useNativeTokenDetailed, useChainDetailed } from '@masknet/web3-shared'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { FixedTokenList, FixedTokenListProps } from '../../../extension/options-page/DashboardComponents/FixedTokenList'
import { WalletMessages } from '../../Wallet/messages'
import { delay, useI18N } from '../../../utils'
import { useRemoteControlledDialog, useStylesExtends } from '@masknet/shared'
import { SearchIcon } from '@masknet/icons'
import { getMaskColor } from '@masknet/theme'

const useStyles = makeStyles((theme: Theme) => ({
    searchbox: {
        display: 'block',
        width: '100%',
        border: `1px solid ${getMaskColor(theme).border}`,
        alignItems: 'center',
        padding: theme.spacing(1),
    },
    search: {
        display: 'flex',
        alignItems: 'center',
    },
    input: {
        width: '100%',
    },
    iconButton: {
        padding: theme.spacing(0.5),
    },
    label: {
        width: '100%',
        paddingLeft: theme.spacing(1),
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
    const chainDetailed = useChainDetailed()
    const [visible, setVisible] = useState(false)

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
            setVisible(false)
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
        setVisible(false)
    }, [id, setDialog])
    //#endregion

    return (
        <InjectedDialog open={open} onClose={onClose} title={t('plugin_wallet_select_a_token')} maxWidth="xs">
            <DialogContent>
                {!disableSearchBar ? (
                    <Paper className={classes.searchbox}>
                        {visible ? (
                            <Typography variant="body2" className={classes.label}>
                                {t('add_token_search_hint')}
                            </Typography>
                        ) : null}
                        <Paper component="form" className={classes.search}>
                            <IconButton className={classes.iconButton} aria-label="menu">
                                <SearchIcon />
                            </IconButton>
                            <InputBase
                                className={classes.input}
                                inputProps={{ 'aria-label': 'select a token' }}
                                placeholder={t('add_token_search_hint')}
                                value={keyword}
                                onChange={(e) => {
                                    setKeyword(e.target.value)
                                    setVisible(e.target.value.length !== 0)
                                }}
                            />
                        </Paper>
                    </Paper>
                ) : null}
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
