import { useChainId, useCurrentWeb3NetworkPluginID } from '@masknet/plugin-infra/web3'
import { makeStyles } from '@masknet/theme'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { Box, BoxProps, Button, FormControl, FormControlLabel, Radio, RadioGroup, Typography } from '@mui/material'
import classnames from 'classnames'
import { FC, memo, useCallback, useMemo, useState } from 'react'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { PluginWalletStatusBar } from '../../../utils'
import { ChainBoundary } from '../../../web3/UI/ChainBoundary'
import { TargetRuntimeContext, useTip, useTipValidate } from '../contexts'
import { useI18N } from '../locales'
import { TipType } from '../types'
import { NFTSection } from './NFTSection'
import { RecipientSelect } from './RecipientSelect'
import { TokenSection } from './TokenSection'

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
            padding: theme.spacing(2, 2, 0),
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

export const TipForm: FC<Props> = memo(({ className, onAddToken, onSent, ...rest }) => {
    const t = useI18N()
    const currentChainId = useChainId()
    const pluginId = useCurrentWeb3NetworkPluginID()
    const { targetChainId: chainId } = TargetRuntimeContext.useContainer()
    const { classes } = useStyles({})
    const { isSending, sendTip, tipType, setTipType } = useTip()
    const [isValid, validateMessage] = useTipValidate()
    const [empty, setEmpty] = useState(false)

    const buttonLabel = isSending ? t.sending_tip() : isValid || !validateMessage ? t.send_tip() : validateMessage
    const enabledNft = useMemo(() => {
        if (isSending) return false
        if (chainId !== currentChainId) return false
        if (pluginId === NetworkPluginID.PLUGIN_EVM) {
            return [ChainId.Mainnet, ChainId.BSC, ChainId.Matic].includes(currentChainId as ChainId)
        }
        return pluginId === NetworkPluginID.PLUGIN_SOLANA
    }, [chainId, currentChainId, pluginId])
    const send = useCallback(async () => {
        const hash = await sendTip()
        if (typeof hash !== 'string') return
        onSent?.()
    }, [sendTip, onSent])

    const isEvm = pluginId === NetworkPluginID.PLUGIN_EVM

    return (
        <Box className={classnames(classes.root, className)} {...rest}>
            <div className={classes.main}>
                <FormControl fullWidth className={classes.receiverRow}>
                    <Typography className={classes.to}>{t.tip_to()}</Typography>
                    <RecipientSelect />
                </FormControl>
                <FormControl className={classes.controls}>
                    <RadioGroup row value={tipType} onChange={(e) => setTipType(e.target.value as TipType)}>
                        <FormControlLabel
                            disabled={isSending}
                            value={TipType.Token}
                            control={<Radio />}
                            label={t.tip_type_token()}
                        />
                        <FormControlLabel
                            disabled={!enabledNft}
                            value={TipType.NFT}
                            control={<Radio />}
                            label={t.tip_type_nft()}
                        />
                    </RadioGroup>
                    {tipType === TipType.NFT && !empty && isEvm ? (
                        <Button variant="text" className={classes.addButton} onClick={onAddToken}>
                            {t.tip_add_collectibles()}
                        </Button>
                    ) : null}
                </FormControl>
                {tipType === TipType.Token ? (
                    <FormControl className={classes.tokenField}>
                        <TokenSection />
                    </FormControl>
                ) : (
                    <NFTSection onEmpty={setEmpty} onAddToken={onAddToken} />
                )}
            </div>

            <PluginWalletStatusBar>
                <ChainBoundary
                    expectedPluginID={
                        [NetworkPluginID.PLUGIN_EVM, NetworkPluginID.PLUGIN_SOLANA].includes(pluginId)
                            ? pluginId
                            : NetworkPluginID.PLUGIN_EVM
                    }
                    expectedChainId={chainId}
                    noSwitchNetworkTip
                    ActionButtonPromiseProps={{
                        fullWidth: true,
                    }}>
                    <ActionButton fullWidth disabled={!isValid || isSending} onClick={send}>
                        {buttonLabel}
                    </ActionButton>
                </ChainBoundary>
            </PluginWalletStatusBar>
        </Box>
    )
})
