import { Icons } from '@masknet/icons'
import { ProgressiveText, ReversedAddress } from '@masknet/shared'
import { ShadowRootTooltip, makeStyles } from '@masknet/theme'
import { Box, Button, InputBase, Typography, inputBaseClasses } from '@mui/material'
import { memo, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FRIEND_TECH_CONTRACT_ADDRESS } from '../constants.js'
import { useEstimateSellGas } from './hooks/useEstimateSellGas.js'
import { useAccount, useGasPrice } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { BigNumber } from 'bignumber.js'
import { useOwnKeys } from './hooks/useOwnKeys.js'
import { useUser } from './hooks/useUser.js'
import { formatBalance } from '@masknet/web3-shared-base'
import { Plural, Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    icon: {
        filter: 'drop-shadow(0px 6px 12px rgba(1, 186, 250, 0.20))',
    },
    summary: {
        display: 'flex',
        fontSize: 14,
        fontWeight: 700,
        alignItems: 'center',
        color: theme.palette.maskColor.main,
    },
    bold: {
        fontSize: 18,
        marginLeft: 4,
        marginRight: 4,
    },
    input: {
        position: 'relative',
        height: 66,
        padding: theme.spacing(1.25, 1.5),
        color: theme.palette.maskColor.main,
        fontWeight: 700,
        [`& > .${inputBaseClasses.input}`]: {
            paddingTop: `${theme.spacing(2.75)}!important`,
            paddingBottom: '0px !important',
            flex: 2,
            paddingLeft: '0px !important',
            fontSize: 14,
            fontWeight: 400,
            '&::-webkit-outer-spin-button,&::-webkit-inner-spin-button': {
                WebkitAppearance: 'none',
                margin: 0,
            },
        },
    },
    amountLabel: {
        position: 'absolute',
        top: 10,
        left: 12,
        color: theme.palette.maskColor.second,
        fontFamily: 'Helvetica',
        fontSize: 13,
        lineHeight: '18px',
        whiteSpace: 'nowrap',
        '& > sub': {
            position: 'absolute',
            top: -2,
            right: -2,
        },
    },
    infos: {
        border: `1px solid ${theme.palette.maskColor.line}`,
        padding: theme.spacing(1.5),
        marginTop: theme.spacing(1.5),
        borderRadius: 8,
    },
    infoRow: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: theme.spacing(1),
    },
    infoLabel: {
        fontSize: 14,
        color: theme.palette.maskColor.second,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: 700,
    },
}))

export const Order = memo(function Order() {
    const { classes, theme } = useStyles()
    const account = useAccount()
    const [params, setParams] = useSearchParams()
    const [count, setCount] = useState(1)
    const address = params.get('address')!
    useEffect(() => {
        setParams(
            (p) => {
                p.set('count', count.toString())
                return p.toString()
            },
            { replace: true },
        )
    }, [count])

    const { data: user, isLoading: loadingPrice } = useUser(address)
    const { data: own, isLoading: loadingOwnCount } = useOwnKeys(address, account)
    const { data: gas, isPending: isEstimating } = useEstimateSellGas(address, account, count.toString())
    const [price, { isLoading: isLoadingPrice }] = useGasPrice(NetworkPluginID.PLUGIN_EVM, {
        chainId: ChainId.Base,
    })
    const gasFee = useMemo(() => {
        if (!price || !gas) return 0
        const value = new BigNumber(price).times(gas)
        return formatBalance(value, 18)
    }, [price, gas])

    const cost = useMemo(() => {
        const value = new BigNumber(user?.displayPrice ?? 0).times(count)
        return formatBalance(value, 18)
    }, [user?.displayPrice, count])

    return (
        <Box p={2}>
            <Box display="flex" flexDirection="column" alignItems="center" py={1.5}>
                <Icons.FriendTech className={classes.icon} size={64} />
                <Box display="flex" gap={1.5} mt={1.5} alignItems="center">
                    <ProgressiveText
                        className={classes.summary}
                        component="div"
                        skeletonWidth={150}
                        loading={loadingPrice}>
                        <Trans>
                            Sell <b className={classes.bold}>{count}</b> <Plural value={count} one="key" other="keys" />{' '}
                            for <b className={classes.bold}>{cost}</b> ETH
                        </Trans>
                    </ProgressiveText>
                    <ShadowRootTooltip
                        title={
                            <Trans>
                                The price of next share is equal to the S^2 / 16000*1 ether where S is the current
                                number of keys.
                            </Trans>
                        }
                        placement="top"
                        PopperProps={{ style: { width: 268 } }}>
                        <Icons.Questions color={theme.palette.maskColor.second} size={18} />
                    </ShadowRootTooltip>
                </Box>
                <ProgressiveText loading={loadingOwnCount} fontWeight={700} skeletonWidth={150}>
                    <Trans>
                        You currently hold: {own} <Plural value={count} one="key" other="keys" />
                    </Trans>
                </ProgressiveText>
            </Box>
            <Box display="flex" gap={2} mt={1.5}>
                <Button variant="outlined" onClick={() => setCount((v) => Math.max(v - 1, 1))} disabled={count <= 1}>
                    <Icons.Minus size={20} color={theme.palette.maskColor.danger} />
                </Button>
                <InputBase
                    fullWidth
                    className={classes.input}
                    type="number"
                    value={count}
                    inputProps={{
                        min: 1,
                        max: own,
                        disabled: !!own && count <= 1 && count < own,
                    }}
                    onChange={(event) => {
                        let value = Number.parseInt(event.currentTarget.value, 10)
                        value = Number.isNaN(value) ? 1 : value
                        setCount(Math.max(1, value))
                    }}
                    startAdornment={
                        <Typography className={classes.amountLabel}>
                            <Trans>Amount</Trans>*
                        </Typography>
                    }
                />
                <Button variant="outlined" onClick={() => setCount((v) => v + 1)} disabled={own ? count >= own : true}>
                    <Icons.Plus size={20} color={theme.palette.maskColor.main} />
                </Button>
            </Box>
            <div className={classes.infos}>
                <div className={classes.infoRow}>
                    <Typography className={classes.infoLabel}>
                        <Trans>From</Trans>
                    </Typography>
                    <Typography className={classes.infoValue} component="div">
                        <ReversedAddress address={account} />
                    </Typography>
                </div>
                <div className={classes.infoRow}>
                    <Typography className={classes.infoLabel}>
                        <Trans>To</Trans>
                    </Typography>
                    <Typography className={classes.infoValue} component="div">
                        <ReversedAddress address={FRIEND_TECH_CONTRACT_ADDRESS} />
                    </Typography>
                </div>
                <div className={classes.infoRow}>
                    <Typography className={classes.infoLabel}>
                        <Trans>Action</Trans>
                    </Typography>
                    <Typography className={classes.infoValue}>
                        <Trans>Sell Key</Trans>
                    </Typography>
                </div>
                <div className={classes.infoRow}>
                    <Typography className={classes.infoLabel}>
                        <Trans>Total Amount</Trans>
                    </Typography>
                    <Typography className={classes.infoValue}>{cost} ETH</Typography>
                </div>
                <div className={classes.infoRow}>
                    <Typography className={classes.infoLabel}>
                        <Trans>Gas fee</Trans>
                    </Typography>
                    <ProgressiveText
                        className={classes.infoValue}
                        loading={isEstimating || isLoadingPrice}
                        skeletonWidth={50}>
                        {gasFee} ETH
                    </ProgressiveText>
                </div>
            </div>
        </Box>
    )
})
