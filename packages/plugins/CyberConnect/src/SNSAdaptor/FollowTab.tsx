import { Link, Stack, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import Avatar from 'boring-avatars'
import { ChainId, explorerResolver, formatEthereumAddress } from '@masknet/web3-shared-evm'
import type { IFollowIdentity } from '../Worker/apis/index.js'
import { Icons } from '@masknet/icons'
import { CopyIconButton } from '@masknet/shared'

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
    },
    PopupLink: {
        width: 16,
        height: 16,
        transform: 'translate(0px, -2px)',
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
                    {identity.ens || formatEthereumAddress(identity.address, 16)}
                </Typography>
                <Stack className={classes.address}>
                    <Typography className={classes.namespace} component="div">
                        From {identity.namespace}
                    </Typography>
                    <Link
                        onClick={(event) => event.stopPropagation()}
                        style={{ width: 12, height: 12 }}
                        href={explorerResolver.addressLink(ChainId.Mainnet, identity?.address ?? '') ?? ''}
                        target="_blank"
                        rel="noopener noreferrer">
                        <Icons.PopupLink className={classes.PopupLink} />
                    </Link>
                    <CopyIconButton text={identity.address} className={classes.icon} />
                </Stack>
            </div>
        </div>
    )
}
