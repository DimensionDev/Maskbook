import { memo } from 'react'
import { MenuItem, Typography } from '@mui/material'
import { FormattedAddress } from '@masknet/shared'
import { formatEthereumAddress } from '../../../../../../../web3-shared/evm'
import { makeStyles } from '@masknet/theme'
import { useReverseAddress } from '@masknet/plugin-infra'

const useStyles = makeStyles()({
    menuItem: {
        padding: 8,
        display: 'flex',
        justifyContent: 'space-between',
        '&>*': {
            fontSize: 12,
            lineHeight: '16px',
        },
    },
    domain: {
        fontSize: 12,
        color: '#7B8192',
        lineHeight: '16px',
        marginLeft: 10,
        maxWidth: 80,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
})

export interface AccountItemProps {
    account: {
        name: string
        address: string
    }
    onClick: () => void
}

export const AccountItem = memo<AccountItemProps>(({ account, onClick }) => {
    const { classes } = useStyles()

    const { value: domain } = useReverseAddress(account.address)

    return (
        <MenuItem className={classes.menuItem} onClick={onClick}>
            <Typography display="flex">
                {account.name}
                {domain ? (
                    <Typography component="span" className={classes.domain}>
                        {domain}
                    </Typography>
                ) : null}
            </Typography>
            <Typography>
                <FormattedAddress address={account.address ?? ''} size={4} formatter={formatEthereumAddress} />
            </Typography>
        </MenuItem>
    )
})
