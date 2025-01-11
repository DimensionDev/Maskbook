import { Select, Trans } from '@lingui/react/macro'
import { makeStyles } from '@masknet/theme'
import { formatCompact, isSameAddress, trimZero, type Transaction } from '@masknet/web3-shared-base'
import { type ChainId, type SchemaType } from '@masknet/web3-shared-evm'
import { Typography, type TypographyProps } from '@mui/material'
import { BigNumber } from 'bignumber.js'
import { memo } from 'react'
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

function formatAmount(amount: string) {
    const bn = new BigNumber(amount)
    if (Number.isNaN(bn.toNumber())) {
        return amount
    }
    return trimZero(
        formatCompact(bn.toNumber(), {
            maximumFractionDigits: 4,
        }),
    )
}

function SummaryTypography(props: TypographyProps<'div'>) {
    const { classes, cx } = useStyles({ size: 20 })
    return <Typography {...props} component="div" className={cx(classes.summary, props.className)} />
}

interface Props extends TypographyProps<'div'> {
    transaction: Transaction<ChainId, SchemaType>
}
export const FeedSummary = memo<Props>(function FeedSummary({ transaction, ...rest }) {
    const { classes, cx } = useStyles({ size: 20 })
    const owner = useFeedOwner()

    const txType = transaction.type
    if (!txType) return null

    const otherAddress = isSameAddress(owner.address, transaction.from) ? transaction.to : transaction.from

    const approvalSummaries = transaction.approveAssets?.map((asset, index) => {
        return (
            <Typography
                key={`approval-${index}`}
                component="div"
                {...rest}
                className={cx(classes.summary, rest.className)}>
                {asset.amount === '0' ?
                    <Trans>
                        <AccountLabel address={asset.sender} /> unapproved <Label>{asset.symbol || asset.name}</Label>
                    </Trans>
                :   <Trans>
                        <AccountLabel address={asset.sender} /> approved{' '}
                        <Label>
                            {formatAmount(asset.amount)} {asset.symbol || asset.name}
                        </Label>
                    </Trans>
                }
            </Typography>
        )
    })

    // transfers can coexist with approvals
    if (['trade', 'mint'].includes(txType) && transaction.assets.length === 2) {
        const inAsset = transaction.assets.find((x) => x.direction === 'receive')
        const outAsset = transaction.assets.find((x) => x.direction === 'send')
        if ((inAsset && outAsset) || approvalSummaries?.length) {
            return (
                <>
                    {inAsset && outAsset ?
                        <SummaryTypography {...rest}>
                            <Trans>
                                <AccountLabel address={owner.address} />{' '}
                                <Select value={txType} _trade="traded" _mint="minted" other="traded" />{' '}
                                <Label>
                                    {formatAmount(inAsset.amount)} {inAsset.symbol || inAsset.name}
                                </Label>{' '}
                                for{' '}
                                <Label>
                                    {formatAmount(outAsset.amount)} {outAsset.symbol || outAsset.name}
                                </Label>
                            </Trans>
                        </SummaryTypography>
                    :   null}
                    {approvalSummaries}
                </>
            )
        }
    }
    if (['burn', 'deposit', 'mint', 'receive', 'send', 'withdraw'].includes(txType)) {
        return (
            <>
                {transaction.assets.map((asset, index) => (
                    <SummaryTypography key={`burn-${index}`} {...rest}>
                        <Trans>
                            <AccountLabel address={owner.address} />{' '}
                            <Select
                                value={txType}
                                _burn="burned"
                                _deposit="deposited"
                                _mint="minted"
                                _receive="received"
                                _send="sent"
                                _withdraw="withdrawn"
                            />{' '}
                            <Label>
                                {formatAmount(asset.amount)} {asset.symbol || asset.name}
                            </Label>{' '}
                        </Trans>
                    </SummaryTypography>
                ))}
            </>
        )
    }

    if (['deploy', 'execute'].includes(txType)) {
        return (
            <>
                <SummaryTypography {...rest}>
                    <Trans>
                        <AccountLabel address={owner.address} />
                        <Select value={txType} _deploy="deployed" _execute="executed" />
                        <AccountLabel address={otherAddress} />
                    </Trans>
                </SummaryTypography>
                {approvalSummaries}
            </>
        )
    }

    if (txType === 'approve') {
        return approvalSummaries?.length ? approvalSummaries : (
                <SummaryTypography {...rest}>
                    <Trans>
                        <AccountLabel address={owner.address} /> approved with <AccountLabel address={transaction.to} />
                    </Trans>
                </SummaryTypography>
            )
    }

    return (
        <SummaryTypography {...rest}>
            <Trans>
                <AccountLabel address={owner.address} /> interacted with <AccountLabel address={otherAddress} />
            </Trans>
        </SummaryTypography>
    )
})
