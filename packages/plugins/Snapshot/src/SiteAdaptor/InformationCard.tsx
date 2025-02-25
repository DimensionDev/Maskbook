import { Plural, Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { EthereumBlockie } from '@masknet/shared'
import { formatWithCommas } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { EVMExplorerResolver } from '@masknet/web3-providers'
import { resolveIPFS_URL, resolveResourceURL } from '@masknet/web3-shared-base'
import { Avatar, Box, Link, Typography } from '@mui/material'
import { format as formatDateTime } from 'date-fns'
import { useContext, type PropsWithChildren, type ReactNode } from 'react'
import urlcat from 'urlcat'
import { SNAPSHOT_IPFS } from '../constants.js'
import { SnapshotContext } from '../context.js'
import { useProposal } from './hooks/useProposal.js'
import { SnapshotCard } from './SnapshotCard.js'
import { formatLongHex, formatSpaceId } from './helpers.js'

interface InfoFieldProps extends withClasses<'field'>, PropsWithChildren {
    title: ReactNode
}

const useStyles = makeStyles()((theme) => {
    return {
        infos: {
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
        },
        field: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
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
    const authorProfile = `https://snapshot.box/#/${identifier.space}/profile/${proposal.address}`
    const link = `https://snapshot.box/#/${identifier.space}/proposal/${identifier.id.split('/').pop()}`
    return (
        <SnapshotCard title={<Trans>Information</Trans>}>
            <div className={classes.infos}>
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
                    <Link className={classes.link} target="_blank" rel="noopener" href={authorProfile}>
                        <div className={classes.avatarWrapper}>
                            {proposal.authorAvatar ?
                                <Avatar src={resolveIPFS_URL(proposal.authorAvatar)} className={classes.avatar} />
                            :   <EthereumBlockie address={proposal.address} />}
                        </div>
                        <Typography fontSize={14}>
                            {proposal.space.id ? formatSpaceId(proposal.space.id) : formatLongHex(proposal.address)}
                        </Typography>
                    </Link>
                </InfoField>
                {proposal.ipfs ?
                    <InfoField title={<Trans>IPFS</Trans>} classes={{ field: classes.infoColor }}>
                        <Link
                            className={classes.link}
                            target="_blank"
                            rel="noopener"
                            href={resolveResourceURL(urlcat(SNAPSHOT_IPFS, proposal.ipfs))}>
                            <Typography fontSize={14}>#{identifier.id.slice(0, 7)}</Typography>
                            <Icons.LinkOut size={16} sx={{ paddingLeft: 1 }} />
                        </Link>
                    </InfoField>
                :   null}
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
                    <Link className={classes.link} target="_blank" rel="noopener" href={link}>
                        <Typography fontSize={14}>{formatWithCommas(snapshot)}</Typography>
                        <Icons.LinkOut size={16} sx={{ paddingLeft: 1 }} />
                    </Link>
                </InfoField>
            </div>
        </SnapshotCard>
    )
}
