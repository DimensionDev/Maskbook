import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { EmojiAvatar } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { useAccount } from '@masknet/web3-hooks-base'
import { EVMExplorerResolver } from '@masknet/web3-providers'
import type { FireflyRedPacketAPI } from '@masknet/web3-providers/types'
import { formatBalance, isSameAddress } from '@masknet/web3-shared-base'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { Typography } from '@mui/material'
import { memo, type HTMLProps } from 'react'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1),
        padding: theme.spacing(0.5),
    },
    user: {
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
    },
    userName: {
        display: 'flex',
        gap: 4,
    },
    handle: {
        fontWeight: 700,
        fontSize: 14,
        color: theme.palette.maskColor.main,
        display: 'flex',
    },
    badge: {
        height: 24,
        padding: '0 8px',
        lineHeight: '24px',
        backgroundColor: 'rgba(28, 104, 243, 0.1)',
        borderRadius: 999,
    },
    address: {
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        '&>a': {
            fontSize: 0,
        },
    },
    asset: {
        color: theme.palette.maskColor.main,
        fontSize: 14,
        fontWeight: 700,
        marginLeft: 'auto',
    },
    symbol: {
        color: theme.palette.maskColor.second,
        fontWeight: 700,
        marginLeft: theme.spacing(1),
    },
}))

interface Props extends HTMLProps<HTMLDivElement> {
    record: FireflyRedPacketAPI.ClaimInfo
    chainId: number
}

export const ClaimRecord = memo(function ClaimRecord({ className, record, chainId, ...rest }: Props) {
    const { classes, theme } = useStyles()
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    return (
        <div className={classes.container} {...rest}>
            <EmojiAvatar value={record.creator} />
            <div className={classes.user}>
                {record.ens_name ?
                    <div className={classes.userName}>
                        <Typography className={classes.handle}>{record.ens_name}</Typography>
                        {isSameAddress(account, record.creator) ?
                            <Typography className={classes.badge}>
                                <Trans>My wallet</Trans>
                            </Typography>
                        :   null}
                    </div>
                :   null}
                <Typography className={classes.address}>
                    <Typography component="span">{formatEthereumAddress(record.creator, 4)}</Typography>
                    <a href={EVMExplorerResolver.addressLink(chainId, record.creator)} target="_blank">
                        <Icons.LinkOut size={20} color={theme.palette.maskColor.second} />
                    </a>
                </Typography>
            </div>
            <Typography className={classes.asset} component="div">
                {formatBalance(record.token_amounts, record.token_decimal, {
                    significant: 6,
                    isPrecise: true,
                })}
                <Typography component="span" className={classes.symbol}>
                    {record.token_symbol}
                </Typography>
            </Typography>
        </div>
    )
})
