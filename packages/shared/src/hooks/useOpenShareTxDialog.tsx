import { memo, useCallback } from 'react'
import { makeStyles } from '@masknet/theme'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { explorerResolver } from '@masknet/web3-shared-evm'
import { Done as DoneIcon } from '@mui/icons-material'
import { Link, Typography } from '@mui/material'
import { useSharedI18N } from '../locales/index.js'
import { ConfirmModal } from '../UI/modals/index.js'

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
    message?: string
    content?: string
    hash: string
    buttonLabel?: string
    // TODO Expose onShare until we have share API added our runtime
    onShare?: () => void
}

type ShareTransactionProps = Omit<ShareTransactionOptions, 'title' | 'onShare'>

const ShareTransaction = memo(({ message, content, hash }: ShareTransactionProps) => {
    const { classes } = useStyles()
    const t = useSharedI18N()
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const link = explorerResolver.transactionLink(chainId, hash)
    return (
        <div className={classes.content}>
            <DoneIcon className={classes.icon} />
            {message ? (
                <Typography className={classes.primary} color="textPrimary" variant="subtitle1">
                    {message}
                </Typography>
            ) : null}
            {content ? (
                <Typography className={classes.secondary} color="textSecondary">
                    {content}
                </Typography>
            ) : null}
            {link ? (
                <Typography>
                    <Link className={classes.link} href={link} target="_blank" rel="noopener noreferrer">
                        {t.share_dialog_view_on_explorer()}
                    </Link>
                </Typography>
            ) : null}
        </div>
    )
})

export function useOpenShareTxDialog() {
    const t = useSharedI18N()

    return useCallback(
        async ({ title, message, content, hash, buttonLabel, onShare }: ShareTransactionOptions) => {
            const confirmed = await ConfirmModal.openAndWaitForClose({
                title: title ?? t.share_dialog_transaction(),
                content: (
                    <ShareTransaction
                        message={message ?? t.share_dialog_transaction_confirmed()}
                        content={content}
                        hash={hash}
                    />
                ),
                confirmLabel: onShare ? buttonLabel ?? t.dialog_share() : t.dialog_dismiss(),
            })
            if (confirmed) onShare?.()
        },
        [t],
    )
}
