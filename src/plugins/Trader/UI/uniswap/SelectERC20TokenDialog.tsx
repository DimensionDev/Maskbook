import React, { useState } from 'react'
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
import { useI18N } from '../../../../utils/i18n-next-ui'
import ShadowRootDialog from '../../../../utils/shadow-root/ShadowRootDialog'
import { useStylesExtends } from '../../../../components/custom-ui-helper'
import { DialogDismissIconUI } from '../../../../components/InjectedComponents/DialogDismissIcon'
import {
    useTwitterDialog,
    useTwitterButton,
    useTwitterCloseButton,
} from '../../../../social-network-provider/twitter.com/utils/theme'
import { getActivatedUI } from '../../../../social-network/ui'
import { useCapturedInput } from '../../../../utils/hooks/useCapturedEvents'
import type { Token } from '../../../../web3/types'
import { FixedTokenList } from '../../../../extension/options-page/DashboardComponents/FixedTokenList'

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
    > {
    open: boolean
    excludeTokens: string[]
    onSubmit(token: Token): void
    onClose(): void
}

function SelectERC20TokenDialogUI(props: SelectERC20TokenDialogUIProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const { open, excludeTokens, onSubmit, onClose } = props

    //#region capture event
    const [, inputRef] = useCapturedInput()
    //#endregion

    //#region search tokens
    const [keyword, setKeyword] = useState('')
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
