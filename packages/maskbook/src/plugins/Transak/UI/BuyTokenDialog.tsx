import React, { useState } from 'react'
import { createStyles, makeStyles, withStyles } from '@material-ui/core'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { useI18N } from '../../../utils/i18n-next-ui'
import { MaskbookTransakMessages, TransakMessageCenter } from '../messages'
import { Transak } from './Transak'
import { useBlurContext } from '../../../extension/options-page/DashboardContexts/BlurContext'

const GlobalCss = withStyles({
    '@global': {
        '#transak_modal-overlay': {
            // disable close the buy dialog when click the backdrop
            display: 'none',
        },
    },
})(() => null)

const useStyles = makeStyles((theme) =>
    createStyles({
        paper: {
            width: '370px !important',
        },
    }),
)

export interface BuyTokenDialogProps extends withClasses<KeysInferFromUseStyles<typeof useStyles> | 'root'> {}

export function BuyTokenDialog(props: BuyTokenDialogProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    //#region remote controlled buy token dialog
    const [address, setAddress] = useState('')
    const [open, setOpen] = useRemoteControlledDialog<MaskbookTransakMessages, 'buyTokenDialogUpdated'>(
        TransakMessageCenter,
        'buyTokenDialogUpdated',
        (ev) => {
            if (ev.open) setAddress(ev.address)
        },
    )
    //#endregion

    // render in dashboard
    useBlurContext(open)

    return (
        <div className={classes.root}>
            <GlobalCss />
            <Transak
                open={open}
                onClose={() =>
                    setOpen({
                        open: false,
                    })
                }
                TransakSDKConfig={{
                    walletAddress: address,
                }}
            />
        </div>
    )
}
