import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { EmojiAvatar } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { useAccount, useWeb3Utils } from '@masknet/web3-hooks-base'
import type { FireflyRedPacketAPI } from '@masknet/web3-providers/types'
import { isSameAddress } from '@masknet/web3-shared-base'
import { Typography } from '@mui/material'
import { memo, type HTMLProps } from 'react'
import { formatTokenAmount } from '../helpers/formatTokenAmount.js'

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
    const account = useAccount()
    const Utils = useWeb3Utils()

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
                    <Typography component="span">{Utils.formatAddress(record.creator, 4)}</Typography>
                    <a href={Utils.explorerResolver.addressLink(chainId, record.creator)} target="_blank">
                        <Icons.LinkOut size={20} color={theme.palette.maskColor.second} />
                    </a>
                </Typography>
            </div>
            <Typography className={classes.asset} component="div">
                {formatTokenAmount(record.token_amounts || 0, record.token_decimal, false)}
                <Typography component="span" className={classes.symbol}>
                    {record.token_symbol}
                </Typography>
            </Typography>
        </div>
    )
})
