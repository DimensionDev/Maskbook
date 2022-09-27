import { FC, memo, useCallback, useContext, useMemo, useState } from 'react'
import { useSubscription } from 'use-subscription'
import { UNDEFINED } from '@masknet/shared-base'
import classnames from 'classnames'
import {
    useChainId,
    useCurrentWeb3NetworkPluginID,
    useWeb3State,
    useGasPrice,
    useNativeTokenPrice,
    useNativeToken,
} from '@masknet/plugin-infra/web3'
import { makeStyles, ActionButton } from '@masknet/theme'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { ChainId as ChainIdEVM } from '@masknet/web3-shared-evm'
import { ChainId as ChainIdSolana } from '@masknet/web3-shared-solana'
import { SelectGasSettingsToolbar } from '@masknet/shared'
import { Box, BoxProps, Button, FormControl, FormControlLabel, Radio, RadioGroup, Typography } from '@mui/material'
import { useI18N } from '../../../locales/index.js'
import { NFTSection } from '../NFTList/index.js'
import { RecipientSelect } from './RecipientSelect.js'
import { TokenSection } from '../TokenSection/index.js'
import { TipsContext } from '../../Context/TipsContext.js'
import { AssetType } from '../../../types/index.js'
import { useValidation } from '../../hooks/useValidation.js'
import { PluginContext } from '../../Context/PluginContext.js'
import { PluginWalletStatusBar } from '../../../../../utils/index.js'
import { ChainBoundary } from '../../../../../web3/UI/ChainBoundary.js'

const useStyles = makeStyles<{}, 'icon'>()((theme, _, refs) => {
    return {
        root: {
            display: 'flex',
            flexDirection: 'column',
        },
        main: {
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            overflow: 'auto',
            padding: theme.spacing(2),
        },
        receiverRow: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
        },
        to: {
            fontSize: 19,
            fontWeight: 500,
        },
        address: {
            height: 48,
            flexGrow: 1,
            marginLeft: theme.spacing(1),
        },
        select: {
            display: 'flex',
            alignItems: 'center',
            [`& .${refs.icon}`]: {
                display: 'none',
            },
        },
        menuItem: {
            height: 40,
        },
        icon: {},
        link: {
            display: 'inline-flex',
            alignItems: 'center',
        },
        actionIcon: {
            marginRight: theme.spacing(1),
            color: theme.palette.text.secondary,
        },
        checkIcon: {
            marginLeft: 'auto',
        },
        controls: {
            marginTop: theme.spacing(1),
            display: 'flex',
            flexDirection: 'row',
        },
        addButton: {
            marginLeft: 'auto',
        },
        tokenField: {
            marginTop: theme.spacing(2),
        },
    }
})

interface Props extends BoxProps {
    onAddToken?(): void
    onSent?(): void
}

const GAS_LIMIT = 21000

export const TipsForm: FC<Props> = memo(({ className, onAddToken, onSent, ...rest }) => {
    const t = useI18N()
    const { classes } = useStyles({})
    const { chainId: globalChainId } = PluginContext.useContainer()
    const pluginID = useCurrentWeb3NetworkPluginID()
    const chainId = useChainId()
    const { Others } = useWeb3State()
    const { value: nativeToken } = useNativeToken(pluginID, {
        chainId,
    })
    const { value: nativeTokenPrice = 0 } = useNativeTokenPrice(pluginID, {
        chainId,
    })
    const { assetType, setAssetType, loading, transferCallback, transaction } = useContext(TipsContext)
    const computedTransaction = useSubscription(transaction?.transaction ?? UNDEFINED)
    const [isValid, validationMessage] = useValidation()
    const [empty, setEmpty] = useState(false)

    const enableNonFungibleOption = useMemo(() => {
        if (loading) return false
        if (chainId !== globalChainId) return false
        if (pluginID === NetworkPluginID.PLUGIN_EVM) {
            return [ChainIdEVM.Mainnet, ChainIdEVM.BSC, ChainIdEVM.Matic].includes(chainId as ChainIdEVM)
        }
        if (pluginID === NetworkPluginID.PLUGIN_SOLANA) {
            return [ChainIdSolana.Mainnet].includes(chainId as ChainIdSolana)
        }
        return false
    }, [chainId, globalChainId, pluginID, loading])
    const send = useCallback(async () => {
        const hash = await transferCallback()
        if (typeof hash !== 'string') return
        onSent?.()
    }, [transferCallback, onSent])

    return (
        <Box className={classnames(classes.root, className)} {...rest}>
            <div className={classes.main}>
                <FormControl fullWidth className={classes.receiverRow}>
                    <Typography className={classes.to}>{t.tip_to()}</Typography>
                    <RecipientSelect />
                </FormControl>
                <FormControl className={classes.controls}>
                    <RadioGroup row value={assetType} onChange={(e) => setAssetType(e.target.value as AssetType)}>
                        <FormControlLabel
                            disabled={loading}
                            value={AssetType.FungibleToken}
                            control={<Radio />}
                            label={t.tip_type_token()}
                        />
                        <FormControlLabel
                            disabled={!enableNonFungibleOption}
                            value={AssetType.NonFungibleToken}
                            control={<Radio />}
                            label={t.tip_type_nft()}
                        />
                    </RadioGroup>
                    {assetType === AssetType.NonFungibleToken && pluginID === NetworkPluginID.PLUGIN_EVM && !empty ? (
                        <Button variant="text" className={classes.addButton} onClick={onAddToken}>
                            {t.tip_add_collectibles()}
                        </Button>
                    ) : null}
                </FormControl>
                {assetType === AssetType.FungibleToken ? (
                    <FormControl className={classes.tokenField}>
                        <TokenSection />
                    </FormControl>
                ) : (
                    <NFTSection onEmpty={setEmpty} onAddToken={onAddToken} />
                )}
                {nativeToken ? (
                    <SelectGasSettingsToolbar
                        nativeToken={nativeToken}
                        nativeTokenPrice={nativeTokenPrice}
                        transaction={computedTransaction}
                        onChange={async (tx) => {
                            if (tx) {
                                await transaction?.update(tx)
                            }
                        }}
                    />
                ) : null}
            </div>
            <PluginWalletStatusBar>
                <ChainBoundary
                    expectedPluginID={
                        [NetworkPluginID.PLUGIN_EVM, NetworkPluginID.PLUGIN_SOLANA].includes(pluginID)
                            ? pluginID
                            : NetworkPluginID.PLUGIN_EVM
                    }
                    expectedChainId={chainId}
                    noSwitchNetworkTip
                    ActionButtonPromiseProps={{
                        fullWidth: true,
                    }}>
                    <ActionButton fullWidth disabled={!isValid || loading} onClick={send}>
                        {loading ? t.sending_tip() : isValid || !validationMessage ? t.send_tip() : validationMessage}
                    </ActionButton>
                </ChainBoundary>
            </PluginWalletStatusBar>
        </Box>
    )
})
