import { formatFileSize } from '@dimensiondev/kit'
import { Paper, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { DownloadCloud, File } from 'react-feather'
import { useI18N } from '../../../utils'
import { CopyableCode } from './components/Copyable'
import type { FileInfo, Provider } from '../types'
import urlcat from 'urlcat'

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        alignItems: 'center',
        width: 345,
        border: `1px solid ${theme.palette.divider}`,
        boxSizing: 'border-box',
        borderRadius: 12,
        padding: theme.spacing(2),
        cursor: 'default',
        userSelect: 'none',
        '& p': { margin: 0 },
    },
    meta: {
        flex: 1,
        minWidth: '1%',
        marginLeft: 18,
        marginRight: 18,
        fontSize: 14,
        lineHeight: 1.85,
    },
    name: {
        fontSize: 16,
        lineHeight: 1.85,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
    },
    code: {
        lineHeight: 1,
        userSelect: 'auto',
    },
    download: {
        display: 'block',
        cursor: 'pointer',
    },
}))

function getGatewayAPI(provider: Provider) {
    if (provider === 'arweave') {
        return 'https://arweave.net/';
    } else if (provider === 'ipfs') {
        return 'https://infura-ipfs.io/ipfs/';
    } else if (provider === 'swarm') {
        return 'https://bee-2.gateway.ethswarm.org/bzz/';
    }
    throw new Error('unsupported provider')
}

export function Preview({ info }: { info: FileInfo }) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const fileKey = info.key ? (
        <Typography component="p" color="textPrimary">
            {t('plugin_file_service_file_key')} <CopyableCode className={classes.code}>{info.key}</CopyableCode>
        </Typography>
    ) : (
        <Typography component="p" color="textSecondary">
            {t('plugin_file_service_unencrypted')}
        </Typography>
    )

    const linkPrefix = getGatewayAPI(info.provider)
    const link = urlcat(linkPrefix, '/:txId', { txId: info.landingTxID })

    const onClick = (event: React.MouseEvent) => {
        event.preventDefault()
        event.stopPropagation()
        open(info.key ? `${link}#${info.key}` : link)
    }
    return (
        <Paper
            elevation={0}
            className={classes.root}
            onClick={process.env.architecture === 'app' ? onClick : undefined}>
            <File className={classes.download} width={44} height={44} onClick={onClick} />
            <section className={classes.meta}>
                <Typography component="p" color="textPrimary" className={classes.name} title={info.name}>
                    {info.name}
                </Typography>
                <Typography component="p" color="textSecondary">
                    {formatFileSize(info.size)}
                </Typography>
                {fileKey}
            </section>
            <DownloadCloud className={classes.download} width={24} height={24} onClick={onClick} />
        </Paper>
    )
}
