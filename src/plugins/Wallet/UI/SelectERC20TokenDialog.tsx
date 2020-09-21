import React, { useMemo, useState, useEffect, useCallback } from 'react'
import Fuse from 'fuse.js'
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
import { useAsync } from 'react-use'
import Services from '../../../extension/service'
import { EthereumAddress } from 'wallet.ts'
import { useToken } from '../../../web3/hooks/useToken'
import { EthereumTokenType, Token } from '../../../web3/types'
import { useChainId } from '../../../web3/hooks/useChainId'

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
            color: theme.palette.text.secondary,
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

    //#region fetch from token lists
    const [lists, setLists] = useState<string[]>([])
    const { value: tokens = [], loading: loadingTokens } = useAsync(
        () => Services.Ethereum.fetchTokensFromTokenLists(lists),
        [lists.sort().join()],
    )
    //#endregion

    //#region search tokens
    const [query, setQuery] = useState('')
    const [address, setAddress] = useState('')
    const [trackedTokens, fuse] = useMemo(() => {
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
    }, [tokens])
    const searchedTokens = useMemo(() => {
        return query
            ? [
                  ...(EthereumAddress.isValid(query)
                      ? trackedTokens.filter((token) => isSameAddress(token.address, query))
                      : []),
                  ...fuse.search(query).map((x) => x.item),
              ]
            : trackedTokens
    }, [query, fuse, trackedTokens])
    //#endregion

    //#region add token by address
    const chainId = useChainId()
    const unsearchedToken = useMemo(() => {
        if (!EthereumAddress.isValid(query)) return
        if (searchedTokens.length) return
        else
            return {
                chainId,
                type: EthereumTokenType.ERC20,
                address: query,
            }
    }, [query, chainId, searchedTokens.length])
    const { value: searchedToken, loading: loadingSearchedToken } = useToken(unsearchedToken)
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
                            if (token) {
                                setAddress(token.address)
                                onSubmit(token)
                            }
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
        (message: string) => <Typography className={classes.placeholder}>{message}</Typography>,
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
                        value={query}
                        variant="outlined"
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    {(() => {
                        if (loadingTokens) return renderPlaceholder('Loading token lists...')
                        if (searchedTokens.length) return renderList(searchedTokens)
                        if (loadingSearchedToken) return renderPlaceholder('Loading token...')
                        if (searchedToken) return renderList([searchedToken])
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
