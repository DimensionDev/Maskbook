import type { Wallet } from '@masknet/shared-base'
import { makeStyles, usePopupCustomSnackbar } from '@masknet/theme'
import { useAsync, useCopyToClipboard } from 'react-use'
import { memo, useCallback, useState } from 'react'
import Services from '#services'
import { Icons } from '@masknet/icons'
import { MaskSharedTrans } from '../../../shared-ui/index.js'
import { Box, Typography, alpha } from '@mui/material'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { WalletBalance } from '../index.js'
import { useToggle } from '@react-hookz/web'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    root: {
        padding: theme.spacing(1),
        display: 'flex',
        alignItems: 'center',
    },
    name: {
        fontSize: 12,
        lineHeight: '16px',
        fontWeight: 700,
    },
    address: {
        color: theme.palette.maskColor.second,
        fontSize: 12,
        lineHeight: '16px',
    },
    balance: {
        fontSize: 12,
        lineHeight: '16px',
        color: theme.palette.maskColor.main,
        '& > span': {
            color: theme.palette.maskColor.second,
            fontSize: 12,
            lineHeight: '16px',
        },
    },
    arrowIcon: {
        marginLeft: theme.spacing(2),
        cursor: 'pointer',
        transition: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
    },
    expand: {
        transform: 'rotate(180deg)',
    },
    privateKey: {
        padding: theme.spacing(1.5),
        background: theme.palette.maskColor.input,
        position: 'relative',
        borderRadius: 8,
    },
    text: {
        fontSize: 14,
        lineHeight: '18px',
        wordWrap: 'break-word',
    },
    view: {
        color: theme.palette.maskColor.main,
        cursor: 'pointer',
        position: 'absolute',
        bottom: 6,
        right: 12,
    },
    mask: {
        background: alpha(theme.palette.mode === 'dark' ? '#000000' : '#ffffff', 0.4),
        backdropFilter: 'blur(5px)',
        position: 'absolute',
        zIndex: 1,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        top: 0,
        left: 0,
        cursor: 'pointer',
        columnGap: 12,
    },
    tips: {
        color: theme.palette.maskColor.second,
        fontSize: 14,
        lineHeight: '18px',
        textAlign: 'left',
    },
    copy: {
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        columnGap: 8,
        fontSize: 14,
        lineHeight: '18px',
        justifyContent: 'center',
        marginTop: theme.spacing(1.5),
    },
}))

interface PrimaryKeyDisplayProps {
    wallet: Wallet
    hiddenArrow?: boolean
}

export const PrivateKeyDisplay = memo<PrimaryKeyDisplayProps>(function PrivateKeyDisplay({ wallet, hiddenArrow }) {
    const [display, toggle] = useToggle(false)
    const [expand, setExpand] = useState(!!hiddenArrow)
    const { classes, cx } = useStyles()
    const { showSnackbar } = usePopupCustomSnackbar()
    const [, copyToClipboard] = useCopyToClipboard()

    const { value: privateKey } = useAsync(async () => {
        if (!wallet) return
        return Services.Wallet.exportPrivateKey(wallet.address)
    }, [wallet])

    const handleCopy = useCallback(() => {
        if (!privateKey) return
        copyToClipboard(privateKey)
        showSnackbar(<Trans>Copied</Trans>)
    }, [privateKey])

    return (
        <Box>
            <Box className={classes.root}>
                <Icons.MaskBlue size={24} />
                <Box ml={1} flex={1}>
                    <Typography className={classes.name}>{wallet.name}</Typography>
                    <Typography className={classes.address}>{formatEthereumAddress(wallet.address, 4)}</Typography>
                </Box>
                <Box display="flex" height="32px" alignItems="flex-end">
                    <WalletBalance className={classes.balance} skeletonWidth={60} account={wallet.address} />
                </Box>
                {!hiddenArrow ?
                    <Icons.ArrowDownRound
                        onClick={() => setExpand(!expand)}
                        size={20}
                        className={cx(classes.arrowIcon, expand ? classes.expand : undefined)}
                    />
                :   null}
            </Box>
            {expand ?
                <>
                    <Box className={classes.privateKey}>
                        {!display ?
                            <Box className={classes.mask} onClick={toggle}>
                                <Icons.EyeOff size={24} />
                                <Typography className={classes.tips}>
                                    {/* eslint-disable-next-line react/naming-convention/component-name */}
                                    <MaskSharedTrans.popups_wallet_backup_private_key_view_tips
                                        components={{ br: <br /> }}
                                    />
                                </Typography>
                            </Box>
                        :   null}
                        <Typography className={classes.text}>{privateKey}</Typography>
                        <Icons.EyeColor onClick={toggle} size={20} className={classes.view} />
                    </Box>
                    <Typography className={classes.copy} onClick={handleCopy}>
                        <Icons.Copy size={20} />
                        <Trans>Copy private key</Trans>
                    </Typography>
                </>
            :   null}
        </Box>
    )
})
