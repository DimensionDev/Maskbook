import React, { useMemo, useState, useEffect } from 'react'
import Fuse from 'fuse.js'
import { getNetworkERC20Tokens } from '../../Wallet/UI/EthereumNetworkSettings'
import { useCurrentEthChain } from '../../shared/useWallet'
import {
    makeStyles,
    createStyles,
    Theme,
    DialogTitle,
    IconButton,
    Typography,
    Divider,
    DialogContent,
    TextField,
} from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import ShadowRootDialog from '../../../utils/shadow-root/ShadowRootDialog'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { DialogDismissIconUI } from '../../../components/InjectedComponents/DialogDismissIcon'
import { MessageCenter, MaskbookWalletMessages } from '../messages'
import { FixedSizeList } from 'react-window'
import { TokenInList } from '../../../extension/options-page/DashboardComponents/TokenInList'
import { isSameAddr } from '../../Wallet/token'
import {
    useTwitterDialog,
    useTwitterButton,
    useTwitterCloseButton,
} from '../../../social-network-provider/twitter.com/utils/theme'
import { getActivatedUI } from '../../../social-network/ui'
import type { ERC20Token } from '../../../web3/types'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        paper: {
            width: '400px !important',
        },
        title: {
            marginLeft: 6,
        },
        search: {
            margin: theme.spacing(1, 0, 2),
        },
        list: {
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
    }),
)

interface SelectERC20TokenDialogUIProps
    extends withClasses<
        | KeysInferFromUseStyles<typeof useStyles>
        | 'root'
        | 'title'
        | 'dialog'
        | 'backdrop'
        | 'container'
        | 'paper'
        | 'header'
        | 'content'
        | 'close'
    > {}

function SelectERC20TokenDialogUI(props: SelectERC20TokenDialogUIProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    //#region update tokens
    const [query, setQuery] = useState('')
    const [address, setAddress] = useState('')
    const network = useCurrentEthChain()
    const [erc20Tokens, fuse] = useMemo(() => {
        const tokens = getNetworkERC20Tokens(network)
        const fuse = new Fuse(tokens, {
            shouldSort: true,
            threshold: 0.45,
            minMatchCharLength: 1,
            keys: [
                { name: 'name', weight: 0.5 },
                { name: 'symbol', weight: 0.5 },
            ],
        })
        return [tokens, fuse] as const
    }, [network])
    const [tokens, setTokens] = useState<ERC20Token[]>([])
    const [excludeTokens, setExcludeTokens] = useState<string[]>([])

    useEffect(() => {
        setTokens(
            query
                ? [
                      ...erc20Tokens.filter((token) => token.address.toLowerCase() === query.toLowerCase()),
                      ...fuse.search(query).map((x) => x.item),
                  ]
                : erc20Tokens,
        )
    }, [erc20Tokens, fuse, query])
    //#endregion

    //#region dialog
    const [open, setOpen] = useRemoteControlledDialog<MaskbookWalletMessages, 'selectERC20TokenDialogUpdated'>(
        MessageCenter,
        'selectERC20TokenDialogUpdated',
        (ev) => {
            if (!ev.open) return
            setAddress(ev.address ?? '')
            setExcludeTokens(ev.excludeTokens ?? [])
        },
    )

    // submit token
    const onSubmit = (address: string) =>
        setOpen({
            open: false,
            token: address ? tokens.find((x) => x.address === address) : undefined,
        })

    // close dialog with message center
    const onClose = () =>
        setOpen({
            open: false,
        })

    //#endregion

    return (
        <div className={classes.root}>
            <ShadowRootDialog
                className={classes.dialog}
                classes={{
                    container: classes.container,
                    paper: classes.paper,
                }}
                open={open}
                scroll="body"
                fullWidth
                maxWidth="sm"
                disableAutoFocus
                disableEnforceFocus
                onEscapeKeyDown={onClose}
                onExit={onClose}
                BackdropProps={{
                    className: classes.backdrop,
                }}>
                <DialogTitle className={classes.header}>
                    <IconButton classes={{ root: classes.close }} onClick={onClose}>
                        <DialogDismissIconUI />
                    </IconButton>
                    <Typography className={classes.title} display="inline" variant="inherit">
                        {t('plugin_trader_display_name')}
                    </Typography>
                </DialogTitle>
                <Divider />
                <DialogContent className={classes.content}>
                    <TextField
                        className={classes.search}
                        label={t('add_token_search_hint')}
                        autoFocus
                        fullWidth
                        value={query}
                        variant="outlined"
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <FixedSizeList
                        className={classes.list}
                        key={tokens.length}
                        width="100%"
                        height={288}
                        overscanCount={4}
                        itemSize={48}
                        itemData={{
                            tokens,
                            excludeTokens,
                            selected: address,
                            onSelect(address: string) {
                                if (!tokens.some((token) => isSameAddr(token.address, address))) return
                                setAddress(address)
                                onSubmit(address)
                            },
                        }}
                        itemCount={tokens.length}>
                        {TokenInList}
                    </FixedSizeList>
                </DialogContent>
            </ShadowRootDialog>
        </div>
    )
}

export interface SelectERC20TokenDialogProps extends SelectERC20TokenDialogUIProps {}

export function SelectERC20TokenDialog(props: SelectERC20TokenDialogProps) {
    const ui = getActivatedUI()
    const twitterClasses = {
        ...useTwitterDialog(),
        ...useTwitterButton(),
        ...useTwitterCloseButton(),
    }

    return ui.internalName === 'twitter' ? (
        <SelectERC20TokenDialogUI classes={twitterClasses} {...props} />
    ) : (
        <SelectERC20TokenDialogUI {...props} />
    )
}
