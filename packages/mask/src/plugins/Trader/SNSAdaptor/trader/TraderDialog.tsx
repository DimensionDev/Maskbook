import { useEffect, useRef, useState } from 'react'
import { PluginId } from '@masknet/plugin-infra'
import { useActivatedPlugin } from '@masknet/plugin-infra/dom'
import { useChainId, useChainIdValid, useCurrentWeb3NetworkPluginID } from '@masknet/plugin-infra/web3'
import type { ChainId } from '@masknet/web3-shared-evm'
import { DialogContent, dialogTitleClasses, IconButton } from '@mui/material'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { InjectedDialog, useSelectAdvancedSettings } from '@masknet/shared'
import { AllProviderTradeContext } from '../../trader/useAllProviderTradeContext'
import { TargetChainIdContext } from '@masknet/plugin-infra/web3-evm'
import { PluginTraderMessages } from '../../messages'
import { Trader, TraderRef, TraderProps } from './Trader'
import { useI18N } from '../../../../utils'
import { makeStyles } from '@masknet/theme'
import { NetworkTab } from '../../../../components/shared/NetworkTab'
import { useUpdateEffect } from 'react-use'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { GearIcon, RefreshIcon } from '@masknet/icons'
import { currentSlippageSettings } from '../../settings'

const useStyles = makeStyles()((theme) => ({
    abstractTabWrapper: {
        width: '100%',
        position: 'sticky',
        top: 0,
        zIndex: 2,
    },
    indicator: {
        display: 'none',
    },
    content: {
        padding: 0,
        minHeight: 556,
        display: 'flex',
        flexDirection: 'column',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    tradeRoot: {},
    tail: {
        display: 'flex',
        gap: 8,
        '& > button': {
            padding: 0,
            width: 24,
            height: 24,
        },
    },
    icon: {
        fontSize: 24,
        fill: theme.palette.text.primary,
        cursor: 'pointer',
    },
    dialog: {
        [`.${dialogTitleClasses.root}`]: {
            // 'row !important' is not assignable to FlexDirection
            flexDirection: 'row !important' as 'row',
            '& > p': {
                justifyContent: 'center !important',
            },
        },
    },
}))

interface TraderDialogProps {
    open?: boolean
    onClose?: () => void
}

export function TraderDialog({ open, onClose }: TraderDialogProps) {
    const tradeRef = useRef<TraderRef>(null)
    const pluginID = useCurrentWeb3NetworkPluginID()
    const traderDefinition = useActivatedPlugin(PluginId.Trader, 'any')
    const chainIdList = traderDefinition?.enableRequirement.web3?.[pluginID]?.supportedChainIds ?? []
    const { t } = useI18N()
    const { classes } = useStyles()
    const currentChainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const chainIdValid = useChainIdValid(NetworkPluginID.PLUGIN_EVM)
    const [traderProps, setTraderProps] = useState<TraderProps>()
    const [chainId, setChainId] = useState<ChainId>(currentChainId)

    const { open: remoteOpen, closeDialog } = useRemoteControlledDialog(
        PluginTraderMessages.swapDialogUpdated,
        (ev) => {
            if (ev?.traderProps) setTraderProps(ev.traderProps)
        },
    )

    const selectAdvancedSettings = useSelectAdvancedSettings(NetworkPluginID.PLUGIN_EVM)

    useEffect(() => {
        if (!chainIdValid) closeDialog()
    }, [chainIdValid, closeDialog])

    useUpdateEffect(() => {
        if (currentChainId) {
            setChainId(currentChainId)
        }
    }, [currentChainId])

    return (
        <TargetChainIdContext.Provider>
            <AllProviderTradeContext.Provider>
                <InjectedDialog
                    open={open || remoteOpen}
                    onClose={() => {
                        onClose?.()
                        setTraderProps(undefined)
                        closeDialog()
                    }}
                    title={t('plugin_trader_swap')}
                    titleTail={
                        <div className={classes.tail}>
                            <IconButton onClick={() => tradeRef.current?.refresh()}>
                                <RefreshIcon className={classes.icon} />
                            </IconButton>
                            <IconButton
                                onClick={async () => {
                                    const { slippageTolerance, transaction } = await selectAdvancedSettings()

                                    if (slippageTolerance) currentSlippageSettings.value = slippageTolerance

                                    PluginTraderMessages.swapSettingsUpdated.sendToAll({
                                        open: false,
                                        gasConfig: {
                                            gasPrice: transaction?.gasPrice as string | undefined,
                                            maxFeePerGas: transaction?.maxFeePerGas as string | undefined,
                                            maxPriorityFeePerGas: transaction?.maxPriorityFeePerGas as
                                                | string
                                                | undefined,
                                        },
                                    })
                                }}>
                                <GearIcon className={classes.icon} />
                            </IconButton>
                        </div>
                    }
                    className={classes.dialog}>
                    <DialogContent className={classes.content}>
                        <div className={classes.abstractTabWrapper}>
                            <NetworkTab
                                chainId={chainId}
                                /* @ts-ignore */
                                setChainId={setChainId}
                                classes={classes}
                                chains={chainIdList}
                            />
                        </div>
                        <Trader
                            {...traderProps}
                            chainId={chainId}
                            classes={{ root: classes.tradeRoot }}
                            ref={tradeRef}
                        />
                    </DialogContent>
                </InjectedDialog>
            </AllProviderTradeContext.Provider>
        </TargetChainIdContext.Provider>
    )
}
