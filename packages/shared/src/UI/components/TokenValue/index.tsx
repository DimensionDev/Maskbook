import { type HTMLProps, useMemo } from 'react'
import { BigNumber } from 'bignumber.js'
import { useChainContext, useFungibleTokenPrice, useNetworkContext } from '@masknet/web3-hooks-base'
import { TokenIcon } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { NetworkPluginID } from '@masknet/shared-base'
import { formatCurrency } from '@masknet/web3-shared-base'
import { Typography } from '@mui/material'
import type { Web3Helper } from '@masknet/web3-helpers'

const useStyles = makeStyles<void, 'tokenIcon'>()((theme, _, ref) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    token: {
        display: 'flex',
        alignItems: 'center',
        [`& .${ref.tokenIcon}`]: {
            marginLeft: theme.spacing(0.5),
        },
    },
    tokenIcon: {},
    amount: {
        color: theme.palette.maskColor.main,
        fontSize: '24px',
        fontWeight: 700,
    },
    price: {
        color: theme.palette.maskColor.third,
        fontSize: '14px',
        fontWeight: 400,
        lineHeight: '18px',
    },
}))

interface Props extends HTMLProps<HTMLDivElement> {
    amount?: string
    token?: Web3Helper.FungibleTokenAll | null
}

export function TokenValue({ className, token, amount, ...rest }: Props) {
    const { classes, cx } = useStyles()
    const { pluginID } = useNetworkContext()
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { data: tokenPrice = 0 } = useFungibleTokenPrice(NetworkPluginID.PLUGIN_EVM, token?.address, { chainId })

    const priceUSD = useMemo(() => {
        if (!tokenPrice || !amount) return
        return formatCurrency(new BigNumber(amount).times(tokenPrice), 'USD', { onlyRemainTwoOrZeroDecimal: true })
    }, [amount, tokenPrice])

    return amount && token ?
            <div className={cx(classes.container, className)} {...rest}>
                <div className={classes.token}>
                    <Typography className={classes.amount} component="strong" fontWeight="700" fontSize="24px">
                        {amount}
                    </Typography>
                    <TokenIcon
                        size={24}
                        badgeSize={12}
                        className={classes.tokenIcon}
                        pluginID={pluginID}
                        chainId={chainId}
                        name={token.name}
                        address={token.address}
                        logoURL={token.logoURL}
                    />
                </div>
                {priceUSD ?
                    <Typography className={classes.price}>{`\u2248 ${priceUSD ?? '0'}`}</Typography>
                :   null}
            </div>
        :   null
}
