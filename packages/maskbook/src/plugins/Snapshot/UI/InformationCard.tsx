import { useState, useContext, Suspense } from 'react'
import { Card, Grid, Box, Link, createStyles, makeStyles, Typography } from '@material-ui/core'
import { format } from 'date-fns'
import OpenInNew from '@material-ui/icons/OpenInNew'

import { useI18N } from '../../../utils/i18n-next-ui'
import { SnapshotCard } from './SnapshotCard'
import { TokenIcon } from '../../../extension/options-page/DashboardComponents/TokenIcon'
import { resolveAddressLinkOnEtherscan, resolveBlockLinkOnEtherscan, resolveIPFSLink } from '../../../web3/pipes'
import { ChainId } from '../../../web3/types'
import { formatEthereumAddress } from '../../Wallet/formatter'

import { SnapshotContext } from '../context'
import { useProposal } from '../hooks/useProposal'

export interface InformationCardProps {}

export interface InfoFieldProps {
    title: string
    children: React.ReactNode
}

const useStyles = makeStyles((theme) => {
    return createStyles({
        field: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            margin: `${theme.spacing(1)} auto`,
        },
        link: {
            display: 'flex',
            color: 'inherit',
            alignItems: 'center',
            marginLeft: theme.spacing(1),
        },
    })
})

function InfoField(props: InfoFieldProps) {
    const classes = useStyles()

    return (
        <Box className={classes.field}>
            <Box>
                <Typography>{props.title}</Typography>
            </Box>
            <Box>{props.children}</Box>
        </Box>
    )
}

export function InformationCard(props: InformationCardProps) {
    const classes = useStyles()
    const { t } = useI18N()

    const identifier = useContext(SnapshotContext)
    const {
        payload: { proposal, message },
    } = useProposal(identifier.id)

    const { start, end, snapshot, metadata } = message.payload
    const author = proposal.address
    const strategy = proposal.address

    //FIXME fix the hard code chainId
    const chainId = ChainId.Mainnet

    return (
        <SnapshotCard title={t('plugin_snapshot_info_title')}>
            <Typography component="div">
                <InfoField title={t('plugin_snapshot_info_strategy')}>
                    <Box sx={{ display: 'flex' }}>
                        {message.payload.metadata.strategies.map((strategy) => (
                            <Link
                                key={strategy.params.address}
                                className={classes.link}
                                target="_blank"
                                rel="noopener"
                                href={resolveAddressLinkOnEtherscan(chainId, strategy.params.address)}>
                                <TokenIcon address={strategy.params.address} />
                            </Link>
                        ))}
                    </Box>
                </InfoField>
                <InfoField title={t('plugin_snapshot_info_author')}>
                    <Link
                        className={classes.link}
                        target="_blank"
                        rel="noopener"
                        href={resolveAddressLinkOnEtherscan(chainId, author)}>
                        {formatEthereumAddress(author, 4)}
                    </Link>
                </InfoField>
                <InfoField title={t('plugin_snapshot_info_ipfs')}>
                    <Link className={classes.link} target="_blank" rel="noopener" href={resolveIPFSLink(identifier.id)}>
                        #{identifier.id.slice(0, 7)}
                        <OpenInNew fontSize="small" />
                    </Link>
                </InfoField>
                <InfoField title={t('plugin_snapshot_info_start')}>
                    {format(new Date(start * 1000), 'MM/dd/yyyy')}
                </InfoField>
                <InfoField title={t('plugin_snapshot_info_end')}>
                    {format(new Date(end * 1000), 'MM/dd/yyyy')}
                </InfoField>
                <InfoField title={t('plugin_snapshot_info_snapshot')}>
                    <Link
                        className={classes.link}
                        target="_blank"
                        rel="noopener"
                        href={resolveBlockLinkOnEtherscan(chainId, snapshot)}>
                        {snapshot}
                        <OpenInNew fontSize="small" />
                    </Link>
                </InfoField>
            </Typography>
        </SnapshotCard>
    )
}
