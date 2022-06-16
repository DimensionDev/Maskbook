import { PopupCopyIcon } from '@masknet/icons'
import { FormattedAddress, TokenIcon, useSnackbarCallback } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { IconButton, Stack, Typography } from '@mui/material'
import { useCopyToClipboard } from 'react-use'

export interface ContractSectionProps {
    logoURL?: string
    address: string
}

const useStyles = makeStyles()((theme) => ({
    icon: {
        width: 16,
        height: 16,
    },
    copy: {
        color: theme.palette.maskColor?.second,
        fontSize: 16,
    },
}))

export const ContractSection = ({ logoURL, address }: ContractSectionProps) => {
    const { classes } = useStyles()
    const [, copyToClipboard] = useCopyToClipboard()

    const onCopyAddress = useSnackbarCallback(async () => {
        if (!address) return
        copyToClipboard(address)
    }, [address])

    return (
        <Stack direction="row" gap={0.5} display="flex" alignItems="center" justifyContent="flex-end">
            <TokenIcon
                classes={{
                    icon: classes.icon,
                }}
                logoURL={logoURL}
                address={address}
            />
            <Typography variant="body2" component="span" fontWeight={700}>
                <FormattedAddress address={address} size={4} formatter={formatEthereumAddress} />
            </Typography>
            <IconButton sx={{ padding: 0 }} color="primary" size="small" onClick={onCopyAddress}>
                <PopupCopyIcon className={classes.copy} />
            </IconButton>
        </Stack>
    )
}
