import { useState } from 'react'
import { DialogContent } from '@mui/material'
import { WalletMessages } from '@masknet/plugin-wallet'
import { makeStyles } from '@masknet/theme'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { GasOptionType } from '@masknet/web3-shared-base'
import { InjectedDialog } from '@masknet/shared'
import { useI18N } from '../../../../utils/index.js'
import { GasSetting } from './GasSetting.js'

const useStyles = makeStyles()((theme) => ({
    content: {
        color: theme.palette.text.primary,
    },
}))

export const GasSettingDialog = () => {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [gasOptionType, setGasOptionType] = useState<GasOptionType>(GasOptionType.NORMAL)
    const [gasLimit, setGasLimit] = useState(0)
    const [minGasLimit, setMinGasLimit] = useState(0)
    const { open, closeDialog, setDialog } = useRemoteControlledDialog(
        WalletMessages.events.gasSettingDialogUpdated,
        (evt) => {
            if (!evt.open) return
            if (evt.gasOption) setGasOptionType(evt.gasOption)
            if (evt.gasLimit) setGasLimit(evt.gasLimit)
            if (evt.minGasLimit !== undefined) setMinGasLimit(evt.minGasLimit)
        },
    )

    return (
        <InjectedDialog title={t('popups_wallet_gas_fee_settings')} open={open} onClose={closeDialog}>
            <DialogContent className={classes.content}>
                <GasSetting
                    gasLimit={gasLimit}
                    minGasLimit={minGasLimit}
                    onGasLimitChange={setGasLimit}
                    gasOptionType={gasOptionType}
                    onGasOptionChange={setGasOptionType}
                    onConfirm={({ gasPrice, gasLimit, maxFee, priorityFee, gasOption }) => {
                        setDialog({
                            open: false,
                            gasOption,
                            gasPrice,
                            gasLimit,
                            priorityFee,
                            maxFee,
                        })
                    }}
                />
            </DialogContent>
        </InjectedDialog>
    )
}
