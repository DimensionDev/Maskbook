import { Select, Trans } from '@lingui/macro'
import { type Transaction } from '@masknet/web3-shared-base'
import { Typography, type TypographyProps } from '@mui/material'
import { memo } from 'react'
import { makeStyles } from '@masknet/theme'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { AccountLabel } from '../components/common.js'

const useStyles = makeStyles<{ size: number }>()((theme) => ({
    summary: {
        display: 'flex',
        gap: theme.spacing(0.5),
        alignItems: 'center',
    },
}))

interface Props extends TypographyProps {
    transaction: Transaction<ChainId, SchemaType>
}
export const FeedSummary = memo<Props>(function FeedSummary({ transaction, ...rest }) {
    const { classes, cx } = useStyles({ size: 20 })

    return (
        <Typography {...rest} className={cx(classes.summary, rest.className)}>
            <Select
                value={transaction.type}
                other={
                    <Trans>
                        <AccountLabel address={transaction.from} />
                        transferred to
                        <AccountLabel address={transaction.to} />
                    </Trans>
                }
            />
        </Typography>
    )
})
