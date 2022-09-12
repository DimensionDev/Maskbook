import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { Link, styled, Switch, SwitchProps, Typography } from '@mui/material'
import { memo } from 'react'
import { WalletIcon } from '../WalletIcon/index.js'

// TODO: replace to UI kit
const IOSSwitch = styled((props: SwitchProps) => (
    <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
    width: 43,
    height: 22,
    padding: 0,
    '& .MuiSwitch-switchBase': {
        padding: 0,
        margin: 3.5,
        transitionDuration: '300ms',
        '&.Mui-checked': {
            transform: 'translateX(22px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
                backgroundColor: theme.palette.maskColor.success,
                opacity: 1,
                border: 0,
            },
            '&.Mui-disabled + .MuiSwitch-track': {
                opacity: 0.5,
            },
        },
        '&.Mui-focusVisible .MuiSwitch-thumb': {
            color: '#33cf4d',
            border: '6px solid #fff',
        },
        '&.Mui-disabled .MuiSwitch-thumb': {
            color: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[600],
        },
        '&.Mui-disabled + .MuiSwitch-track': {
            opacity: theme.palette.mode === 'light' ? 0.7 : 0.3,
        },
    },
    '& .MuiSwitch-thumb': {
        boxSizing: 'border-box',
        width: 14,
        height: 14,
    },
    '& .MuiSwitch-track': {
        borderRadius: 26 / 2,
        backgroundColor: theme.palette.maskColor.primaryMain,
        opacity: 1,
        transition: theme.transitions.create(['background-color'], {
            duration: 500,
        }),
    },
}))

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
                <IOSSwitch checked={checked} onChange={onSwitchChange} />
            </div>
        )
    },
)
