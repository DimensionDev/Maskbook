import { makeStyles } from '@masknet/theme'
import { resolveTransactionLinkOnExplorer, useChainId } from '@masknet/web3-shared-evm'
import DoneIcon from '@mui/icons-material/Done'
import { Link, Typography } from '@mui/material'
import { FC, memo } from 'react'
import { useShowConfirm } from '../contexts'
import { useSharedI18N } from '../locales'

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
    secondary: {
        fontSize: 14,
    },
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

const ShareTransaction: FC<ShareTransactionProps> = memo(({ message, content, hash }) => {
    const { classes } = useStyles()
    const t = useSharedI18N()
    const chainId = useChainId()
    const link = resolveTransactionLinkOnExplorer(chainId, hash)
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
    const showConfirm = useShowConfirm()
    const t = useSharedI18N()

    return async ({ title, message, content, hash, buttonLabel, onShare }: ShareTransactionOptions) => {
        let shared = false
        await showConfirm({
            title: title ?? t.share_dialog_transaction(),
            content: (
                <ShareTransaction
                    message={message ?? t.share_dialog_transaction_confirmed()}
                    content={content}
                    hash={hash}
                />
            ),
            confirmLabel: onShare ? buttonLabel ?? t.dialog_share() : t.dialog_dismiss(),
            onConfirm() {
                onShare?.()
                shared = true
            },
        })
        return shared
    }
}
