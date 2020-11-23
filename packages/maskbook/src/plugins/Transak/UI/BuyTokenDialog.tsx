import { useCallback, useState } from 'react'
import { createStyles, makeStyles, withStyles } from '@material-ui/core'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { useI18N } from '../../../utils/i18n-next-ui'
import { PluginTransakMessages } from '../messages'
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
    const [open, setOpen] = useRemoteControlledDialog(PluginTransakMessages.events.buyTokenDialogUpdated, (ev) => {
        if (ev.open) setAddress(ev.address)
    })
    const onClose = useCallback(() => {
        setOpen({
            open: false,
        })
    }, [setOpen])
    //#endregion

    // render in dashboard
    useBlurContext(open)

    return (
        <div className={classes.root}>
            <GlobalCss />
            <Transak
                open={open}
                onClose={onClose}
                TransakSDKConfig={{
                    walletAddress: address,
                }}
            />
        </div>
    )
}
