import { DialogContent } from '@mui/material'
import { WalletMessages } from '@masknet/plugin-wallet'
import { makeStyles } from '@masknet/theme'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { GasOptionType } from '@masknet/web3-shared-base'
import { GasSettingDialog, InjectedDialog, useSharedI18N } from '@masknet/shared'
import { GasSettingSupported } from './GasSettingSupported.js'
import type { BigNumber } from 'bignumber.js'

const useStyles = makeStyles()((theme) => ({
    content: {
        color: theme.palette.text.primary,
    },
}))

interface GasSettingProps {
    open: boolean
    onClose: () => void
    gasOption?: GasOptionType | null
    gasLimit?: number
    minGasLimit?: number
    gasPrice?: BigNumber.Value
    maxFee?: BigNumber.Value
    priorityFee?: BigNumber.Value
    setGasLimit: (minGasLimit: number) => void
    setGasOptionType: (gasOptionType: GasOptionType) => void
}

export function GasSetting(props: GasSettingProps) {
    const t = useSharedI18N()
    const { classes } = useStyles()
    const {
        open,
        onClose,
        gasOption = GasOptionType.NORMAL,
        gasLimit = 0,
        minGasLimit = 0,
        setGasLimit,
        setGasOptionType,
    } = props

    const { setDialog } = useRemoteControlledDialog(WalletMessages.events.gasSettingUpdated)

    return (
        <InjectedDialog title={t.popups_wallet_gas_fee_settings()} open={open} onClose={onClose}>
            <DialogContent className={classes.content}>
                <GasSettingSupported
                    gasLimit={gasLimit}
                    minGasLimit={minGasLimit}
                    onGasLimitChange={setGasLimit}
                    gasOptionType={gasOption}
                    onGasOptionChange={setGasOptionType}
                    onConfirm={({ gasPrice, gasLimit, maxFee, priorityFee, gasOption }) => {
                        GasSettingDialog.close({
                            gasOption,
                            gasPrice,
                            gasLimit,
                            priorityFee,
                            maxFee,
                        })
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
