import { useEffect, useRef, useState, useMemo } from 'react'
import { useAsyncFn } from 'react-use'
import { PluginID, NetworkPluginID, CrossIsolationMessages, type TokenType, Sniffings } from '@masknet/shared-base'
import { useActivatedPlugin } from '@masknet/plugin-infra/dom'
import {
    useChainContext,
    useChainIdValid,
    useNetworkContext,
    useWeb3Others,
    useFungibleToken,
} from '@masknet/web3-hooks-base'
import { type ChainId, GasEditor, SchemaType, type Transaction } from '@masknet/web3-shared-evm'
import { DialogContent, dialogTitleClasses, IconButton } from '@mui/material'
import { InjectedDialog, NetworkTab, SelectGasSettingsModal } from '@masknet/shared'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import type { Web3Helper } from '@masknet/web3-helpers'
import { AllProviderTradeContext } from '../../trader/useAllProviderTradeContext.js'
import { PluginTraderMessages } from '../../messages.js'
import { Trader, type TraderRef } from './Trader.js'
import { useI18N } from '../../../../utils/index.js'
import { currentSlippageSettings } from '../../settings.js'
import { MIN_GAS_LIMIT } from '../../constants/index.js'

const useStyles = makeStyles()((theme) => ({
    abstractTabWrapper: {
        width: '100%',
        position: 'sticky',
        top: 0,
        zIndex: 2,

        '& > div .MuiBox-root': Sniffings.is_dashboard_page
            ? {
                  background: MaskColorVar.mainBackground,
              }
            : {},
    },
    content: {
        padding: 0,
        minHeight: 564,
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
        color: theme.palette.maskColor.main,
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

export function TraderDialog() {
    const tradeRef = useRef<TraderRef>(null)
    const traderDefinition = useActivatedPlugin(PluginID.Trader, 'any')
    const { pluginID } = useNetworkContext()
    const { chainId, setChainId } = useChainContext()
    const Others = useWeb3Others()
    const chainIdList = traderDefinition?.enableRequirement.web3?.[NetworkPluginID.PLUGIN_EVM]?.supportedChainIds ?? []
    const { t } = useI18N()
    const { classes } = useStyles()

    const chainIdValid = useChainIdValid(pluginID, chainId)
    const [defaultCoins, setDefaultCoins] = useState<
        | {
              defaultInputCoin?: TokenType
              defaultOutputCoin?: TokenType
          }
        | undefined
    >({
        defaultInputCoin: undefined,
        defaultOutputCoin: undefined,
    })

    const [open, setOpen] = useState(false)

    const defaultInputCoin = defaultCoins?.defaultInputCoin
    const defaultOutputCoin = defaultCoins?.defaultOutputCoin

    const inputFungibleToken = useMemo(
        () =>
            Others.createFungibleToken(
                chainId,
                Others.isNativeTokenAddress(defaultInputCoin?.address) ? SchemaType.Native : SchemaType.ERC20,
                defaultInputCoin?.address ?? '',
                defaultInputCoin?.name ?? '',
                defaultInputCoin?.symbol ?? '',
                defaultInputCoin?.decimals ?? 0,
            ),
        [chainId],
    )

    const outputFungibleToken = useMemo(
        () =>
            Others.createFungibleToken(
                chainId,
                Others.isNativeTokenAddress(defaultOutputCoin?.address) ? SchemaType.Native : SchemaType.ERC20,
                defaultOutputCoin?.address ?? '',
                defaultOutputCoin?.name ?? '',
                defaultOutputCoin?.symbol ?? '',
                defaultOutputCoin?.decimals ?? 0,
            ),
        [chainId],
    )

    // TODO: Other network schema support
    const { value: inputToken } = useFungibleToken(pluginID, defaultInputCoin?.address, inputFungibleToken, { chainId })
    const { value: outputToken } = useFungibleToken(pluginID, defaultOutputCoin?.address, outputFungibleToken, {
        chainId,
    })
    // #region update default input or output token

    useEffect(() => {
        return CrossIsolationMessages.events.swapDialogEvent.on(({ open, traderProps }) => {
            setOpen(open)
            if (traderProps) {
                const { defaultInputCoin, defaultOutputCoin } = traderProps
                setDefaultCoins({
                    defaultInputCoin,
                    defaultOutputCoin,
                })
                if (traderProps.chainId) setChainId(traderProps.chainId as Web3Helper.ChainIdAll)
            }
        })
    }, [])
    // #endregion

    useEffect(() => {
        if (!chainIdValid) setOpen(false)
    }, [chainIdValid])

    const [, openGasSettingDialog] = useAsyncFn(async () => {
        SelectGasSettingsModal.openAndWaitForClose({
            chainId,
            disableGasLimit: true,
            disableSlippageTolerance: false,
            transaction: {
                gas: tradeRef.current?.focusedTrade?.gas ?? MIN_GAS_LIMIT,
                ...tradeRef.current?.gasConfig,
            },
            slippageTolerance: currentSlippageSettings.value / 100,
            onSubmit: ({
                slippageTolerance,
                transaction,
            }: {
                slippageTolerance?: number
                transaction?: Web3Helper.TransactionAll
            }) => {
                if (slippageTolerance) currentSlippageSettings.value = slippageTolerance

                PluginTraderMessages.swapSettingsUpdated.sendToAll({
                    open: false,
                    gasConfig: GasEditor.fromTransaction(chainId as ChainId, transaction as Transaction).getGasConfig(),
                })
            },
        })
    }, [chainId, currentSlippageSettings.value])

    return (
        <InjectedDialog
            open={open}
            onClose={() => {
                setDefaultCoins(undefined)
                setOpen(false)
            }}
            title={t('plugin_trader_swap')}
            titleBarIconStyle={Sniffings.is_dashboard_page ? 'close' : 'back'}
            titleTail={
                <div className={classes.tail}>
                    <IconButton onClick={() => tradeRef.current?.refresh()}>
                        <Icons.Refresh size={24} className={classes.icon} />
                    </IconButton>
                    {pluginID === NetworkPluginID.PLUGIN_EVM ? (
                        <IconButton onClick={openGasSettingDialog}>
                            <Icons.Gear size={24} className={classes.icon} />
                        </IconButton>
                    ) : null}
                </div>
            }
            className={classes.dialog}>
            <DialogContent className={classes.content}>
                <div className={classes.abstractTabWrapper}>
                    <NetworkTab chains={chainIdList} pluginID={NetworkPluginID.PLUGIN_EVM} />
                </div>
                <AllProviderTradeContext.Provider>
                    <Trader
                        defaultInputCoin={defaultInputCoin ? inputToken : undefined}
                        defaultOutputCoin={defaultOutputCoin ? outputToken : undefined}
                        chainId={chainId}
                        classes={{ root: classes.tradeRoot }}
                        ref={tradeRef}
                    />
                </AllProviderTradeContext.Provider>
            </DialogContent>
        </InjectedDialog>
    )
}
