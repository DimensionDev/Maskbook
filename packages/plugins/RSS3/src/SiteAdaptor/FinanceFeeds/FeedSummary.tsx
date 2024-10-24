import { Select, Trans } from '@lingui/macro'
import { isSameAddress, type Transaction } from '@masknet/web3-shared-base'
import { Typography, type TypographyProps } from '@mui/material'
import { memo } from 'react'
import { makeStyles } from '@masknet/theme'
import { formatAmount, type ChainId, type SchemaType } from '@masknet/web3-shared-evm'
import { AccountLabel, Label } from '../components/common.js'
import { useFeedOwner } from '../contexts/FeedOwnerContext.js'

const useStyles = makeStyles<{ size: number }>()((theme) => ({
    summary: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: theme.spacing(0.5),
        alignItems: 'center',
    },
}))

interface Props extends TypographyProps {
    transaction: Transaction<ChainId, SchemaType>
}
export const FeedSummary = memo<Props>(function FeedSummary({ transaction, ...rest }) {
    const { classes, cx } = useStyles({ size: 20 })
    const owner = useFeedOwner()

    const otherAddress = isSameAddress(owner.address, transaction.from) ? transaction.to : transaction.from

    return (
        <>
            {transaction.assets.map((asset, index) => {
                return (
                    <Typography key={index} component="div" {...rest} className={cx(classes.summary, rest.className)}>
                        <Select
                            value={asset.direction}
                            _send={
                                <Trans>
                                    <AccountLabel address={owner.address} />
                                    {transaction.cateName}
                                    <AccountLabel address={otherAddress} />
                                </Trans>
                            }
                            other={
                                <Trans>
                                    <AccountLabel address={owner.address} />
                                    {transaction.cateName}{' '}
                                    <Label>
                                        {formatAmount(asset.amount)} {asset.name}
                                    </Label>{' '}
                                    from
                                    <AccountLabel address={otherAddress} />
                                </Trans>
                            }
                        />
                    </Typography>
                )
            })}
        </>
    )
})
