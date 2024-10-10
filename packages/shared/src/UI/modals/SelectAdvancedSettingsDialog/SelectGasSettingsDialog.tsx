import { useMemo, useState } from 'react'
import { useChainContext, useNetworkContext } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { type NetworkPluginID, Sniffings } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { DialogContent } from '@mui/material'
import { SettingsBoard } from '../../components/SettingsBoard/index.js'
import { SettingsContext } from '../../components/SettingsBoard/Context.js'
import { InjectedDialog } from '../../contexts/index.js'
import { Trans } from '@lingui/macro'

interface StyleProps {
    compact: boolean
}

const useStyles = makeStyles<StyleProps>()((theme, { compact }) => ({
    root: {
        width: 600,
        minHeight: compact ? 480 : 620,
    },
    content: {
        padding: theme.spacing(3, 2),
        paddingTop: 0,
    },
}))

export interface SelectGasSettings {
    slippageTolerance?: number
    transaction?: Web3Helper.TransactionAll
}

interface SelectGasSettingsDialogProps<T extends NetworkPluginID = NetworkPluginID> {
    open: boolean
    pluginID?: T
    chainId?: Web3Helper.Definition[T]['ChainId']
    slippageTolerance?: number
    transaction?: Web3Helper.Definition[T]['Transaction']
    title?: string
    disableGasPrice?: boolean
    disableSlippageTolerance?: boolean
    disableGasLimit?: boolean
    onClose(settings?: SelectGasSettings | null): void
}

export function SelectGasSettingsDialog({
    open,
    pluginID,
    chainId,
    slippageTolerance,
    transaction,
    disableGasPrice,
    disableSlippageTolerance,
    disableGasLimit,
    onClose,
    title,
}: SelectGasSettingsDialogProps) {
    const { classes } = useStyles({ compact: disableSlippageTolerance ?? true })
    const { pluginID: pluginID_ } = useNetworkContext(pluginID)
    const { chainId: chainId_ } = useChainContext({ chainId })
    const [settings, setSettings] = useState<SelectGasSettings | null>(null)

    const initialState = useMemo(
        () => ({
            pluginID: pluginID_,
            chainId: chainId_,
            slippageTolerance,
            transaction,
        }),
        [pluginID_, chainId_, slippageTolerance, transaction],
    )

    if (!open) return null

    return (
        <InjectedDialog
            classes={{
                paper: classes.root,
            }}
            open={open}
            titleBarIconStyle={Sniffings.is_dashboard_page ? 'close' : 'back'}
            onClose={() => onClose(settings)}
            title={title ?? <Trans>Advanced Settings</Trans>}>
            <DialogContent classes={{ root: classes.content }}>
                <SettingsContext initialState={initialState}>
                    <SettingsBoard
                        disableGasLimit={disableGasLimit}
                        disableGasPrice={disableGasPrice}
                        disableSlippageTolerance={disableSlippageTolerance}
                        onChange={setSettings}
                    />
                </SettingsContext>
            </DialogContent>
        </InjectedDialog>
    )
}
