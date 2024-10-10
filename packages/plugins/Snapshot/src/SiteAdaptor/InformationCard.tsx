import urlcat from 'urlcat'
import { useContext, type PropsWithChildren, type ReactNode } from 'react'
import { format as formatDateTime } from 'date-fns'
import { Avatar, Box, Link, Typography } from '@mui/material'
import { OpenInNew } from '@mui/icons-material'
import { makeStyles } from '@masknet/theme'
import { EthereumBlockie } from '@masknet/shared'
import { EVMExplorerResolver } from '@masknet/web3-providers'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { resolveIPFS_URL, resolveResourceURL } from '@masknet/web3-shared-base'
import { SnapshotContext } from '../context.js'
import { useProposal } from './hooks/useProposal.js'
import { SnapshotCard } from './SnapshotCard.js'
import { SNAPSHOT_IPFS } from '../constants.js'
import { Plural, Trans } from '@lingui/macro'

interface InfoFieldProps extends withClasses<'field'>, PropsWithChildren {
    title: ReactNode
}

const useStyles = makeStyles()((theme) => {
    return {
        field: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 14,
            color: theme.palette.maskColor.main,
            width: '100%',
        },
        title: {
            fontWeight: 400,
        },
        link: {
            display: 'flex',
            color: 'inherit',
            alignItems: 'center',
            marginLeft: theme.spacing(1),
            textDecoration: 'none !important',
            fontSize: 14,
            fontWeight: 400,
        },
        avatar: {
            width: 16,
            height: 16,
        },
        avatarWrapper: {
            marginRight: 8,
        },
        info: {
            marginTop: 0,
            color: theme.palette.maskColor.publicMain,
        },
        infoColor: {
            color: theme.palette.maskColor.publicMain,
        },
    }
})

export function InfoField(props: InfoFieldProps) {
    const { classes } = useStyles(undefined, { props })
    return (
        <div className={classes.field}>
            <Typography className={classes.title}>{props.title}</Typography>
            <div>{props.children}</div>
        </div>
    )
}

export function InformationCard() {
    const { classes } = useStyles()
    const identifier = useContext(SnapshotContext)
    const proposal = useProposal(identifier.id)
    const { start, end, snapshot, strategies, chainId } = proposal
    return (
        <SnapshotCard title={<Trans>Information</Trans>}>
            <InfoField
                title={<Plural value={strategies.length} one="Strategy" other="Strategies" />}
                classes={{ field: classes.info }}>
                <Box sx={{ display: 'flex' }}>
                    {strategies
                        .filter((strategy) => !!strategy.params.address)
                        .map((strategy, i) => (
                            <Link
                                key={i}
                                className={classes.link}
                                target="_blank"
                                rel="noopener"
                                href={EVMExplorerResolver.addressLink(chainId, strategy.params.address)}>
                                <Avatar src={resolveIPFS_URL(proposal.space.avatar)} className={classes.avatar} />
                            </Link>
                        ))}
                </Box>
            </InfoField>
            <InfoField title={<Trans>Author</Trans>} classes={{ field: classes.infoColor }}>
                <Link
                    className={classes.link}
                    target="_blank"
                    rel="noopener"
                    href={EVMExplorerResolver.addressLink(proposal.chainId, proposal.address)}>
                    <div className={classes.avatarWrapper}>
                        {proposal.authorAvatar ?
                            <Avatar src={resolveIPFS_URL(proposal.authorAvatar)} className={classes.avatar} />
                        :   <EthereumBlockie address={proposal.address} />}
                    </div>
                    <Typography fontSize={14}>
                        {proposal.space.id ?? formatEthereumAddress(proposal.address, 4)}
                    </Typography>
                </Link>
            </InfoField>
            <InfoField title={<Trans>IPFS</Trans>} classes={{ field: classes.infoColor }}>
                <Link
                    className={classes.link}
                    target="_blank"
                    rel="noopener"
                    href={resolveResourceURL(urlcat(SNAPSHOT_IPFS, proposal.ipfs))}>
                    <Typography fontSize={14}>#{identifier.id.slice(0, 7)}</Typography>
                    <OpenInNew fontSize="small" sx={{ paddingLeft: 1 }} />
                </Link>
            </InfoField>
            <InfoField title={<Trans>Start date</Trans>} classes={{ field: classes.infoColor }}>
                <Typography fontSize={14} fontWeight={400}>
                    {formatDateTime(start * 1000, 'MMM dd, yyyy, hh:mm a')}
                </Typography>
            </InfoField>
            <InfoField title={<Trans>End date</Trans>} classes={{ field: classes.infoColor }}>
                <Typography fontSize={14} fontWeight={400}>
                    {formatDateTime(end * 1000, 'MMM dd, yyyy, hh:mm a')}
                </Typography>
            </InfoField>
            <InfoField title={<Trans>Snapshot</Trans>} classes={{ field: classes.infoColor }}>
                <Link
                    className={classes.link}
                    target="_blank"
                    rel="noopener"
                    href={EVMExplorerResolver.blockLink(proposal.chainId, Number.parseInt(snapshot, 10))}>
                    <Typography fontSize={14}>{snapshot}</Typography>
                    <OpenInNew fontSize="small" sx={{ paddingLeft: 1 }} />
                </Link>
            </InfoField>
        </SnapshotCard>
    )
}
