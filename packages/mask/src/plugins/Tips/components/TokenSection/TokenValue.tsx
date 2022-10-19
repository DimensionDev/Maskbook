import { FC, HTMLProps, useMemo } from 'react'
import BigNumber from 'bignumber.js'
import { useChainId, useCurrentWeb3NetworkPluginID, useFungibleTokenPrice } from '@masknet/web3-hooks-base'
import { TokenIcon } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { formatCurrency } from '@masknet/web3-shared-base'
import { Typography } from '@mui/material'
import { useTip } from '../../contexts'

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
            marginLeft: theme.spacing(1),
        },
    },
    tokenIcon: {},
    amount: {
        color: theme.palette.maskColor.main,
        fontFamily: 'Helvetica',
        fontSize: '24px',
        fontWeight: 700,
    },
    price: {
        color: theme.palette.maskColor.third,
        fontSize: '14px',
        fontFamily: 'Helvetica',
        fontWeight: 400,
        lineHeight: '18px',
        marginTop: theme.spacing(0.5),
    },
}))

interface Props extends HTMLProps<HTMLDivElement> {}

export const TokenValue: FC<Props> = ({ className, ...rest }) => {
    const { classes, cx } = useStyles()
    const { token, amount } = useTip()
    const pluginID = useCurrentWeb3NetworkPluginID()
    const chainId = useChainId()
    const { value: tokenPrice = 0 } = useFungibleTokenPrice(pluginID, token?.address, { chainId })

    const priceUSD = useMemo(() => {
        if (!tokenPrice || !amount) return
        return formatCurrency(new BigNumber(amount).times(tokenPrice), 'USD', {
            boundaries: {
                min: 0.01,
            },
        })
    }, [amount, tokenPrice])

    return amount && token ? (
        <div className={cx(classes.container, className)} {...rest}>
            <div className={classes.token}>
                <Typography
                    className={classes.amount}
                    component="strong"
                    fontFamily="Helvetica"
                    fontWeight="700"
                    fontSize="24px">
                    {amount}
                </Typography>
                <TokenIcon
                    className={classes.tokenIcon}
                    pluginID={pluginID}
                    chainId={chainId}
                    name={token.name}
                    address={token.address}
                    logoURL={token.logoURL}
                />
            </div>
            {priceUSD ? <Typography className={classes.price}>{`\u2248 ${priceUSD ?? '0'}`}</Typography> : null}
        </div>
    ) : null
}
