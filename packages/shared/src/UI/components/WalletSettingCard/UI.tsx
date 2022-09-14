import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { Link, Switch, Typography } from '@mui/material'
import { memo } from 'react'
import { WalletIcon } from '../WalletIcon/index.js'

const useStyles = makeStyles()((theme) => ({
    root: {
        boxShadow:
            theme.palette.mode === 'dark' ? '0px 0px 20px rgba(255, 255, 255, 0.12)' : '0 0 20px rgba(0, 0, 0, 0.05)',
        backgroundColor: theme.palette.maskColor.bottom,
        borderRadius: 8,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing(1.25, 1),
    },
    left: {
        display: 'flex',
        columnGap: 10,
        alignItems: 'center',
    },
    name: {
        color: theme.palette.maskColor.main,
        fontSize: 14,
        lineHeight: '18px',
        fontWeight: 700,
    },
    address: {
        color: theme.palette.maskColor.second,
        fontSize: 12,
        lineHeight: '16px',
        display: 'flex',
        alignItems: 'center',
    },
    link: {
        height: 14,
        color: theme.palette.maskColor.second,
    },
}))

interface WalletSettingCardUIProps {
    icon?: URL
    walletName?: string
    formattedAddress?: string
    addressLink?: string
    checked: boolean
    onSwitchChange: () => void
}

export const WalletSettingCardUI = memo<WalletSettingCardUIProps>(
    ({ icon, walletName, formattedAddress, addressLink, checked, onSwitchChange }) => {
        const { classes } = useStyles()

        return (
            <div className={classes.root}>
                <div className={classes.left}>
                    <WalletIcon mainIcon={icon} size={30} />
                    <div>
                        <Typography className={classes.name}>{walletName}</Typography>
                        <Typography className={classes.address}>
                            {formattedAddress}
                            <Link
                                href={addressLink}
                                target="_blank"
                                title="View on Explorer"
                                rel="noopener noreferrer"
                                className={classes.link}>
                                <Icons.LinkOut size={14} />
                            </Link>
                        </Typography>
                    </div>
                </div>
                <Switch checked={checked} onChange={onSwitchChange} />
            </div>
        )
    },
)
