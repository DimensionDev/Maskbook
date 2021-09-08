import {
    EthereumTokenType,
    formatBalance,
    FungibleTokenDetailed,
    isZero,
    pow10,
    TransactionStateType,
    useAccount,
    useTokenBalance,
} from '@masknet/web3-shared'
import classNames from "classnames";
import { DialogContent } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { v4 as uuid } from 'uuid'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { isTwitter } from '../../../social-network-adaptor/twitter.com/base'
import { useRemoteControlledDialog } from '@masknet/shared'
import { useI18N } from '../../../utils/i18n-next-ui'

const useStyles = makeStyles()((theme) => ({
    paper: {
        width: '450px !important',
    },
    root: {
        margin: theme.spacing(2, 0),
    },
}))

export function SocialTokenDialog() {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [id] = useState(uuid())

    // context user data
    const account = useAccount()


    //#region remote controlled dialog
    const { open, closeDialog } = useRemoteControlledDialog(PluginDHedgeMessages.InvestDialogUpdated, (ev) => {
        if (ev.open) {
            setPool(ev.pool)
            setAllowedTokens(ev.tokens)
        }
    })
    const onClose = useCallback(() => {
        setPool(undefined)
        setAllowedTokens([])
        setToken(undefined)
        closeDialog()
    }, [closeDialog])
    //#endregion

    return (
        <div className={classNames.root}>
            <InjectedDialog open={open} onClose={onClose} title={'Social Token'} maxWidth="xs">
                <DialogContent>

                </DialogContent>
        </div>
    )
}
