import { memo, useRef } from 'react'
import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { AccountIcons, ReversedAddress } from '@masknet/shared'
import { Link, MenuItem, Select, Typography } from '@mui/material'
import { useDefaultChainId, useWeb3Utils } from '@masknet/web3-hooks-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { NetworkPluginID, type SocialAccount } from '@masknet/shared-base'
import { useTip } from '../../contexts/index.js'
import { msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

const useStyles = makeStyles<void, 'icon' | 'pluginIcon' | 'text'>()((theme, _, refs) => {
    return {
        root: {
            height: 40,
            flexGrow: 1,
        },
        menuItem: {
            height: 32,
            color: theme.palette.maskColor.main,
            borderRadius: theme.spacing(1),
            padding: theme.spacing(0, 0.5),
            '&:not(:first-of-type)': {
                marginTop: theme.spacing(1),
            },
        },
        text: {
            fontWeight: 700,
            marginLeft: theme.spacing(0.5),
            fontSize: '0.825rem',
        },
        select: {
            display: 'flex',
            alignItems: 'center',
            [`& .${refs.icon}`]: {
                display: 'none',
            },
            [`& .${refs.pluginIcon}`]: {
                display: 'none',
            },
            [`& .${refs.text}`]: {
                fontWeight: 400,
            },
        },
        menuPaper: {
            '::-webkit-scrollbar': {
                display: 'none',
                opacity: 0,
            },
        },
        menu: {
            maxHeight: 312,
            padding: theme.spacing(1.5),
            borderRadius: theme.spacing(2),
        },
        icon: {
            width: 20,
            height: 20,
        },
        pluginIcon: {},
        link: {
            display: 'inline-flex',
            alignItems: 'center',
            fontSize: 0,
        },
        actionIcon: {
            marginLeft: theme.spacing(0.5),
            color: theme.palette.maskColor.main,
        },
        checkIcon: {
            marginLeft: 'auto',
            color: '#60DFAB',
            filter: 'drop-shadow(0px 4px 10px rgba(28, 104, 243, 0.2))',
        },
    }
})

const PluginIcon = ({ pluginID }: { pluginID: NetworkPluginID }) => {
    const { classes } = useStyles()
    const mapping = {
        [NetworkPluginID.PLUGIN_EVM]: (
            // eslint-disable-next-line react/naming-convention/component-name
            <Icons.ETH
                size={20}
                className={classes.pluginIcon}
                style={{
                    filter: 'drop-shadow(0px 6px 12px rgba(98, 126, 234, 0.2))',
                    backdropFilter: 'blur(16px)',
                }}
            />
        ),
        [NetworkPluginID.PLUGIN_FLOW]: (
            <Icons.Flow
                size={20}
                className={classes.pluginIcon}
                style={{
                    filter: 'drop-shadow(0px 6px 12px rgba(25, 251, 155, 0.2))',
                    backdropFilter: 'blur(16px)',
                }}
            />
        ),
        [NetworkPluginID.PLUGIN_SOLANA]: (
            <Icons.Solana
                size={20}
                className={classes.pluginIcon}
                style={{
                    filter: 'drop-shadow(0px 6px 12px rgba(25, 251, 155, 0.2))',
                    backdropFilter: 'blur(16px)',
                }}
            />
        ),
    }
    return mapping[pluginID]
}

function ExternalLink({ account }: { account: SocialAccount<Web3Helper.ChainIdAll> }) {
    const { _ } = useLingui()
    const { classes, cx } = useStyles()
    const Utils = useWeb3Utils(account.pluginID)
    const chainId = useDefaultChainId(account.pluginID)

    return (
        <Link
            className={cx(classes.link, classes.actionIcon, classes.icon)}
            onClick={(e) => e.stopPropagation()}
            href={Utils.explorerResolver.addressLink(chainId, account.address) ?? ''}
            target="_blank"
            title={_(msg`View on Explorer`)}
            rel="noopener noreferrer">
            <Icons.LinkOut size={20} />
        </Link>
    )
}

interface Props {
    className?: string
}

export const RecipientSelect = memo(({ className }: Props) => {
    const { classes, cx } = useStyles()
    const selectRef = useRef(null)
    const { recipient, recipients, setRecipient } = useTip()
    const recipientAddress = recipient?.address

    return (
        <Select
            className={cx(classes.root, className)}
            ref={selectRef}
            value={recipientAddress}
            classes={{ select: classes.select }}
            onChange={(e) => {
                setRecipient(e.target.value)
            }}
            MenuProps={{
                classes: {
                    paper: classes.menuPaper,
                    list: classes.menu,
                },
                anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'center',
                },
                disableScrollLock: true,
                container: selectRef.current,
                anchorEl: selectRef.current,
                BackdropProps: {
                    invisible: true,
                },
            }}>
            {recipients.map((account) => (
                <MenuItem className={classes.menuItem} key={account.address} value={account.address}>
                    <PluginIcon pluginID={account.pluginID} />
                    {account.label ?
                        <Typography component="span" className={classes.text}>
                            {account.label}
                        </Typography>
                    :   <ReversedAddress
                            address={account.address}
                            size={account.address.length}
                            component="span"
                            className={classes.text}
                        />
                    }
                    <ExternalLink account={account} />
                    <AccountIcons socialAccount={account} classes={{ icon: classes.icon }} />
                    {isSameAddress(account.address, recipientAddress) ?
                        <Icons.CheckCircle className={cx(classes.checkIcon, classes.icon)} />
                    :   null}
                </MenuItem>
            ))}
        </Select>
    )
})
