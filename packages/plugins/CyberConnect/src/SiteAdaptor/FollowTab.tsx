import Avatar from 'boring-avatars'
import { Link, Stack, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { ChainId, formatEthereumAddress } from '@masknet/web3-shared-evm'
import { Icons } from '@masknet/icons'
import { CopyButton, FormattedAddress } from '@masknet/shared'
import { EVMExplorerResolver } from '@masknet/web3-providers'
import type { IFollowIdentity } from '../Worker/apis/index.js'

const useStyles = makeStyles()((theme) => ({
    followRow: { display: 'flex', alignItems: 'center', height: '60px', overflow: 'hidden', textOverflow: 'ellipsis' },
    avatarWrapper: { svg: { borderRadius: '100%' } },
    user: { marginLeft: '16px' },
    userName: { fontSize: '16px', lineHeight: '20px', marginBottom: 12 },
    namespace: {
        fontSize: '14px',
        lineHeight: '18px',
        color: theme.palette.maskColor.publicSecond,
    },
    icon: {
        width: 16,
        height: 16,
        color: theme.palette.maskColor.publicSecond,
    },
    PopupLink: {
        width: 16,
        height: 16,
        transform: 'translate(0px, -2px)',
        color: theme.palette.maskColor.publicSecond,
    },
    address: {
        alignItems: 'center',
        gap: 4,
        flexDirection: 'row',
    },
}))

export function FollowRow({ identity }: { identity: IFollowIdentity }) {
    const { classes } = useStyles()
    return (
        <div className={classes.followRow}>
            <div className={classes.avatarWrapper}>
                <Avatar square={false} name={identity.ens || identity.address} size={50} />
            </div>
            <div className={classes.user}>
                <Typography className={classes.userName} component="div">
                    {identity.ens || (
                        <FormattedAddress address={identity.address} formatter={formatEthereumAddress} size={4} />
                    )}
                </Typography>
                <Stack className={classes.address}>
                    <Typography className={classes.namespace} component="div">
                        From {identity.namespace}
                    </Typography>
                    <Link
                        onClick={(event) => event.stopPropagation()}
                        style={{ width: 12, height: 12 }}
                        href={EVMExplorerResolver.addressLink(ChainId.Mainnet, identity.address ?? '') ?? ''}
                        target="_blank"
                        rel="noopener noreferrer">
                        <Icons.PopupLink className={classes.PopupLink} />
                    </Link>
                    <CopyButton text={identity.address} className={classes.icon} size={16} />
                </Stack>
            </div>
        </div>
    )
}
