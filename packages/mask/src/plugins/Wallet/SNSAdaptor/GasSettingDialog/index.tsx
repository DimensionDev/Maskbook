import { FC, useState } from 'react'
import { DialogContent } from '@mui/material'
import { WalletMessages } from '@masknet/plugin-wallet'
import { makeStyles } from '@masknet/theme'
import { useRemoteControlledDialog } from '@masknet/shared'
import { GasOption } from '@masknet/web3-shared-evm'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'
import { useI18N } from '../../../../utils'
import { GasSetting } from './GasSetting'

const useStyles = makeStyles()((theme) => ({
    content: {
        color: theme.palette.text.primary,
    },
}))

export const GasSettingDialog: FC = () => {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [gasOption, setGasOption] = useState<GasOption>(GasOption.Medium)
    const [gasLimit, setGasLimit] = useState(0)
    const [minGasLimit, setMinGasLimit] = useState(0)
    const { open, closeDialog, setDialog } = useRemoteControlledDialog(
        WalletMessages.events.gasSettingDialogUpdated,
        (evt) => {
            if (!evt.open) return
            if (evt.gasOption) setGasOption(evt.gasOption)
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
                    gasOption={gasOption}
                    onGasOptionChange={setGasOption}
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
