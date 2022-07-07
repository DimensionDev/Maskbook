import { FC, useMemo, useState } from 'react'
import { useChainId, useCurrentWeb3NetworkPluginID, Web3Helper } from '@masknet/plugin-infra/web3'
import { useSharedI18N } from '@masknet/shared'
import { isDashboardPage } from '@masknet/shared-base'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { DialogContent } from '@mui/material'
import { InjectedDialog } from '../components'
import { SettingsBoard } from '../../UI/components/SettingsBoard'
import { SettingsContext } from '../../UI/components/SettingsBoard/Context'

const isDashboard = isDashboardPage()

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
    search: {
        backgroundColor: 'transparent !important',
        border: `solid 1px ${MaskColorVar.twitterBorderLine}`,
    },
}))

export interface SelectGasSettingsDialogProps<T extends NetworkPluginID = NetworkPluginID> {
    open: boolean
    pluginID?: T
    chainId?: Web3Helper.Definition[T]['ChainId']
    slippageTolerance?: number
    transaction?: Web3Helper.Definition[T]['Transaction']
    title?: string
    disableGasPrice?: boolean
    disableSlippageTolerance?: boolean
    disableGasLimit?: boolean
    onSubmit?(
        settings: { slippageTolerance?: number; transaction?: Web3Helper.Definition[T]['Transaction'] } | null,
    ): void
    onClose?(): void
}

export const SelectGasSettingsDialog: FC<SelectGasSettingsDialogProps> = ({
    open,
    pluginID,
    chainId,
    slippageTolerance,
    transaction,
    disableGasPrice,
    disableSlippageTolerance,
    disableGasLimit,
    onSubmit,
    onClose,
    title,
}) => {
    const t = useSharedI18N()
    const { classes } = useStyles({ compact: disableSlippageTolerance ?? true })
    const pluginID_ = useCurrentWeb3NetworkPluginID(pluginID)
    const chainId_ = useChainId(pluginID_, chainId)
    const [settings, setSettings] = useState<{
        slippageTolerance?: number
        transaction?: Web3Helper.TransactionAll
    } | null>(null)

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
            titleBarIconStyle={isDashboard ? 'close' : 'back'}
            onClose={() => {
                console.log('DEBUG: settings')
                console.log(settings)
                onSubmit?.(settings)
                onClose?.()
            }}
            title={title ?? t.gas_settings_title()}>
            <DialogContent classes={{ root: classes.content }}>
                <SettingsContext.Provider initialState={initialState}>
                    <SettingsBoard
                        disableGasLimit={disableGasLimit}
                        disableGasPrice={disableGasPrice}
                        disableSlippageTolerance={disableSlippageTolerance}
                        onChange={setSettings}
                    />
                </SettingsContext.Provider>
            </DialogContent>
        </InjectedDialog>
    )
}
