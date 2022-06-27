import type { FC } from 'react'
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

interface StyleProps {
    compact: boolean
}

const useStyles = makeStyles<StyleProps>()((theme, { compact }) => ({
    content: {
        ...(compact ? { minWidth: 552 } : {}),
        padding: theme.spacing(3),
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
    title?: string
    disableGasPrice?: boolean
    disableSlippageTolerance?: boolean
    onSubmit?(settings: { slippageTolerance?: number; option?: Web3Helper.GasOptionAll } | null): void
    onClose?(): void
}

const isDashboard = isDashboardPage()
export const SelectGasSettingsDialog: FC<SelectGasSettingsDialogProps> = ({
    open,
    pluginID,
    chainId,
    disableGasPrice,
    disableSlippageTolerance,
    onSubmit,
    onClose,
    title,
}) => {
    const t = useSharedI18N()
    const { networkIdentifier } = useBaseUIRuntime()
    const compact = networkIdentifier === EnhanceableSite.Minds
    const pluginID_ = useCurrentWeb3NetworkPluginID(pluginID)
    const chainId_ = useChainId(pluginID_, chainId)
    const { classes } = useStyles({ compact })

    return (
        <InjectedDialog
            titleBarIconStyle={isDashboard ? 'close' : 'back'}
            open={open}
            onClose={() => {
                onSubmit?.(null)
                onClose?.()
            }}
            title={title ?? t.gas_settings_title()}>
            <DialogContent classes={{ root: classes.content }}>
                <SettingsContext.Provider
                    initialState={{
                        pluginID: pluginID_,
                        chainId: chainId_,
                    }}>
                    <SettingsBoard
                        disableGasPrice={disableGasPrice}
                        disableSlippageTolerance={disableSlippageTolerance}
                        onSubmit={onSubmit}
                    />
                </SettingsContext.Provider>
            </DialogContent>
        </InjectedDialog>
    )
}
