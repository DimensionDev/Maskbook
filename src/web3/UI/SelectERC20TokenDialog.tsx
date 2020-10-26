import React, { useState } from 'react'
import { makeStyles, createStyles, Theme, DialogContent, TextField } from '@material-ui/core'
import { useI18N } from '../../utils/i18n-next-ui'
import { useStylesExtends } from '../../components/custom-ui-helper'
import type { Token } from '../types'
import { FixedTokenList } from '../../extension/options-page/DashboardComponents/FixedTokenList'
import { InjectedDialog } from '../../components/shared/InjectedDialog'

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

interface SelectERC20TokenDialogUIProps extends withClasses<never> {
    open: boolean
    excludeTokens: string[]
    onSubmit(token: Token): void
    onClose(): void
}

function SelectERC20TokenDialogUI(props: SelectERC20TokenDialogUIProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const { open, excludeTokens, onSubmit, onClose } = props

    //#region search tokens
    const [keyword, setKeyword] = useState('')
    //#endregion

    return (
        <>
            <InjectedDialog open={open} onExit={onClose} title="Select a Token">
                <DialogContent>
                    <TextField
                        className={classes.search}
                        label={t('add_token_search_hint')}
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
            </InjectedDialog>
        </>
    )
}

export interface SelectERC20TokenDialogProps extends SelectERC20TokenDialogUIProps {}

export function SelectERC20TokenDialog(props: SelectERC20TokenDialogProps) {
    return <SelectERC20TokenDialogUI {...props} />
}
