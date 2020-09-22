import React, { useState, useCallback } from 'react'
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
import { WalletMessageCenter, MaskbookWalletMessages } from '../messages'
import { FixedSizeList } from 'react-window'
import { TokenInList } from '../../../extension/options-page/DashboardComponents/TokenInList'
import {
    useTwitterDialog,
    useTwitterButton,
    useTwitterCloseButton,
} from '../../../social-network-provider/twitter.com/utils/theme'
import { getActivatedUI } from '../../../social-network/ui'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { isSameAddress } from '../../../web3/helpers'
import { useCapturedEvents } from '../../../utils/hooks/useCapturedEvents'
import type { Token } from '../../../web3/types'
import { useTokenLists, TokenListsState } from '../../../web3/hooks/useTokenLists'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        paper: {
            width: '400px !important',
        },
        title: {
            marginLeft: 6,
        },
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

    //#region capture event
    const [, inputRef] = useCapturedEvents()
    //#endregion

    //#region the remote controlled dialog
    const [excludeTokens, setExcludeTokens] = useState<string[]>([])
    const [open, setOpen] = useRemoteControlledDialog<MaskbookWalletMessages, 'selectERC20TokenDialogUpdated'>(
        WalletMessageCenter,
        'selectERC20TokenDialogUpdated',
        useCallback((ev: MaskbookWalletMessages['selectERC20TokenDialogUpdated']) => {
            if (!ev.open) return
            setAddress(ev.address ?? '')
            setLists(ev.lists ?? [])
            setExcludeTokens(ev.excludeTokens ?? [])
        }, []),
    )

    // submit token
    const onSubmit = useCallback(
        (token: Token) =>
            setOpen({
                open: false,
                token,
            }),
        [],
    )

    // close dialog with message center
    const onClose = useCallback(
        () =>
            setOpen({
                open: false,
            }),
        [],
    )
    //#endregion

    //#region search tokens
    const [keyword, setKeyword] = useState('')
    const [address, setAddress] = useState('')
    const [lists, setLists] = useState<string[]>([])
    const searchedTokens = useTokenLists(lists, {
        keyword,
        useEther: true,
    })
    //#endregion

    //#region UI helpers
    const renderList = useCallback(
        (tokens: Token[]) => {
            return (
                <FixedSizeList
                    className={classes.list}
                    width="100%"
                    height={288}
                    overscanCount={4}
                    itemSize={48}
                    itemData={{
                        tokens,
                        excludeTokens,
                        selected: address,
                        onSelect(address: string) {
                            const token = tokens.find((token) => isSameAddress(token.address, address))
                            if (!token) return
                            setAddress(token.address)
                            onSubmit(token)
                        },
                    }}
                    itemCount={tokens.length}>
                    {TokenInList}
                </FixedSizeList>
            )
        },
        [address, excludeTokens, TokenInList, onSubmit],
    )
    const renderPlaceholder = useCallback(
        (message: string) => (
            <Typography className={classes.placeholder} color="textSecondary">
                {message}
            </Typography>
        ),
        [],
    )
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
                onBackdropClick={onClose}
                onExit={onClose}
                BackdropProps={{
                    className: classes.backdrop,
                }}>
                <DialogTitle className={classes.header}>
                    <IconButton classes={{ root: classes.close }} onClick={onClose}>
                        <DialogDismissIconUI />
                    </IconButton>
                    <Typography className={classes.title} display="inline" variant="inherit">
                        Select a Token
                    </Typography>
                </DialogTitle>
                <Divider />
                <DialogContent className={classes.content}>
                    <TextField
                        className={classes.search}
                        label={t('add_token_search_hint')}
                        ref={inputRef}
                        autoFocus
                        fullWidth
                        value={keyword}
                        variant="outlined"
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                    {(() => {
                        if (searchedTokens.state === TokenListsState.LOADING_TOKEN_LISTS)
                            return renderPlaceholder('Loading token lists...')
                        if (searchedTokens.state === TokenListsState.LOADING_SEARCHED_TOKEN)
                            return renderPlaceholder('Loading token...')
                        if (searchedTokens.tokens.length) return renderList(searchedTokens.tokens)
                        return renderPlaceholder('No token found')
                    })()}
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
