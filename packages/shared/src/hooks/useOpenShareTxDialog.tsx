import { memo, useCallback, type ReactNode } from 'react'
import { Done as DoneIcon } from '@mui/icons-material'
import { Link, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { EVMExplorerResolver } from '@masknet/web3-providers'
import { useSharedTrans } from '../locales/index.js'
import { ConfirmModal } from '../UI/modals/index.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    content: {
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        fontSize: 64,
        width: 64,
        height: 64,
    },
    link: {
        marginTop: theme.spacing(0.5),
    },
    primary: {
        fontSize: 18,
        marginTop: theme.spacing(1),
    },
    secondary: {},
}))

interface ShareTransactionOptions {
    title?: string
    message?: ReactNode
    content?: string
    hash: string
    buttonLabel?: string
    // TODO Expose onShare until we have share API added our runtime
    onShare?: () => void
}

type ShareTransactionProps = Omit<ShareTransactionOptions, 'title' | 'onShare'>

const ShareTransaction = memo(({ message, content, hash }: ShareTransactionProps) => {
    const { classes } = useStyles()
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const link = EVMExplorerResolver.transactionLink(chainId, hash)
    return (
        <div className={classes.content}>
            <DoneIcon className={classes.icon} />
            {message ?
                <Typography className={classes.primary} color="textPrimary" variant="subtitle1">
                    {message}
                </Typography>
            :   null}
            {content ?
                <Typography className={classes.secondary} color="textSecondary">
                    {content}
                </Typography>
            :   null}
            {link ?
                <Typography>
                    <Link className={classes.link} href={link} target="_blank" rel="noopener noreferrer">
                        <Trans>View on Explorer</Trans>
                    </Link>
                </Typography>
            :   null}
        </div>
    )
})

export function useOpenShareTxDialog() {
    const t = useSharedTrans()

    return useCallback(
        async ({ title, message, content, hash, buttonLabel, onShare }: ShareTransactionOptions) => {
            const confirmed = await ConfirmModal.openAndWaitForClose({
                title: title ?? <Trans>Transaction</Trans>,
                content: (
                    <ShareTransaction
                        message={message ?? <Trans>Your transaction has been confirmed!</Trans>}
                        content={content}
                        hash={hash}
                    />
                ),
                confirmLabel: onShare ? buttonLabel ?? <Trans>Share</Trans> : <Trans>Dismiss</Trans>,
            })
            if (confirmed) onShare?.()
        },
        [t],
    )
}
