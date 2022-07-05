import { FC, useMemo, useState } from 'react'
import { useChainId, useCurrentWeb3NetworkPluginID, Web3Helper } from '@masknet/plugin-infra/web3'
import { useSharedI18N } from '@masknet/shared'
import { EnhanceableSite, isDashboardPage } from '@masknet/shared-base'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { DialogContent } from '@mui/material'
import { useBaseUIRuntime } from '../base'
import { InjectedDialog } from '../components'
import { SettingsBoard } from '../../UI/components/SettingsBoard'
import { SettingsContext } from '../../UI/components/SettingsBoard/Context'

const isDashboard = isDashboardPage()

interface StyleProps {
    compact: boolean
}

const useStyles = makeStyles<StyleProps>()((theme, { compact }) => ({
    root: {
        width: compact ? 552 : 600,
        minHeight: 620,
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
    transaction?: Web3Helper.Definition[T]['Transaction']
    title?: string
    disableGasPrice?: boolean
    disableSlippageTolerance?: boolean
    onSubmit?(
        settings: { slippageTolerance?: number; transaction?: Web3Helper.Definition[T]['Transaction'] } | null,
    ): void
    onClose?(): void
}

export const SelectGasSettingsDialog: FC<SelectGasSettingsDialogProps> = ({
    open,
    pluginID,
    chainId,
    transaction,
    disableGasPrice,
    disableSlippageTolerance,
    onSubmit,
    onClose,
    title,
}) => {
    const t = useSharedI18N()
    const { networkIdentifier } = useBaseUIRuntime()
    const { classes } = useStyles({ compact: networkIdentifier === EnhanceableSite.Minds })
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
            transaction,
        }),
        [pluginID_, chainId_, transaction],
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
                onSubmit?.(settings)
                onClose?.()
            }}
            title={title ?? t.gas_settings_title()}>
            <DialogContent classes={{ root: classes.content }}>
                <SettingsContext.Provider initialState={initialState}>
                    <SettingsBoard
                        disableGasPrice={disableGasPrice}
                        disableSlippageTolerance={disableSlippageTolerance}
                        onChange={setSettings}
                    />
                </SettingsContext.Provider>
            </DialogContent>
        </InjectedDialog>
    )
}
