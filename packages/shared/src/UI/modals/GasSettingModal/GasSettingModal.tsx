import { DialogContent } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { GasOptionType } from '@masknet/web3-shared-base'
import { GasSettingModal, InjectedDialog } from '@masknet/shared'
import { GasSettingSupported } from './GasSettingSupported.js'
import type { BigNumber } from 'bignumber.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    content: {
        color: theme.palette.text.primary,
    },
}))

interface GasSettingProps {
    open: boolean
    onClose: () => void
    gasOption?: GasOptionType
    gasLimit?: number
    minGasLimit?: number
    gasPrice?: BigNumber.Value
    maxFee?: BigNumber.Value
    priorityFee?: BigNumber.Value
    setGasLimit: (minGasLimit: number) => void
    setGasOptionType: (gasOptionType: GasOptionType) => void
}

export function GasSetting(props: GasSettingProps) {
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

    return (
        <InjectedDialog title={<Trans>Gas fee settings</Trans>} open={open} onClose={onClose}>
            <DialogContent className={classes.content}>
                <GasSettingSupported
                    gasLimit={gasLimit}
                    minGasLimit={minGasLimit}
                    onGasLimitChange={setGasLimit}
                    gasOptionType={gasOption}
                    onGasOptionChange={setGasOptionType}
                    onConfirm={({ gasPrice, gasLimit, maxFee, priorityFee, gasOption }) => {
                        GasSettingModal.close({
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
