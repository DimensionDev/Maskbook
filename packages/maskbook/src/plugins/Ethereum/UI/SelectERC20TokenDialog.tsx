import { useCallback, useState } from 'react'
import { makeStyles, createStyles, Theme, DialogContent, TextField } from '@material-ui/core'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { WalletMessages } from '../../Wallet/messages'
import { FixedTokenList } from '../../../extension/options-page/DashboardComponents/FixedTokenList'
import { EthereumMessages } from '../messages'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
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
    }),
)

interface SelectERC20TokenDialogUIProps extends withClasses<never> {}

function SelectERC20TokenDialogUI(props: SelectERC20TokenDialogUIProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const [excludeTokens, setExcludeTokens] = useState<string[]>([])

    //#region remote controlled dialog
    const [open, setERC20TokenDialogOpen] = useRemoteControlledDialog(
        EthereumMessages.events.selectERC20TokenDialogUpdated,
        (ev) => {
            if (ev.open) {
                setExcludeTokens(ev.excludeTokens ?? [])
            }
        },
    )
    const onSubmit = useCallback(() => {
        setERC20TokenDialogOpen({
            open: false,
        })
    }, [setERC20TokenDialogOpen])
    const onClose = useCallback(() => {
        setERC20TokenDialogOpen({
            open: false,
        })
    }, [setERC20TokenDialogOpen])
    //#endregion

    //#region search tokens
    const [keyword, setKeyword] = useState('')
    //#endregion

    return (
        <InjectedDialog open={open} onClose={onClose} title="Select a Token" DialogProps={{ maxWidth: 'xs' }}>
            <DialogContent>
                <TextField
                    className={classes.search}
                    label={t('add_token_search_hint')}
                    autoFocus
                    fullWidth
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                />
                <FixedTokenList
                    classes={{ list: classes.list, placeholder: classes.placeholder }}
                    useEther={true}
                    keyword={keyword}
                    excludeTokens={excludeTokens}
                    onSubmit={onSubmit}
                    FixedSizeListProps={{
                        height: 288,
                        itemSize: 52,
                        overscanCount: 4,
                    }}
                />
            </DialogContent>
        </InjectedDialog>
    )
}

export interface SelectERC20TokenDialogProps extends SelectERC20TokenDialogUIProps {}

export function SelectERC20TokenDialog(props: SelectERC20TokenDialogProps) {
    return <SelectERC20TokenDialogUI {...props} />
}
