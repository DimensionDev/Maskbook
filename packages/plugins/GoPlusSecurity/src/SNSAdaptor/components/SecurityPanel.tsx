import { Link, Stack, Typography } from '@mui/material'
import { useI18N } from '../../locales'
import { ExternalLink } from 'react-feather'
import { makeStyles } from '@masknet/theme'
import { memo, useMemo, useState } from 'react'
import { DefineMapping, SecurityMessageLevel, TokenSecurity } from './Common'
import { SecurityMessages } from '../rules'
import { RiskCard, RiskCardUI } from './RiskCard'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'

interface TokenCardProps {
    tokenSecurity: TokenSecurity
}

const useStyles = makeStyles()((theme) => ({
    root: {
        width: '600px',
    },
    link: {},
    card: {
        borderColor: theme.palette.divider,
        borderStyle: 'solid',
        padding: theme.spacing(1.5),
        borderRadius: 9,
    },
    subtitle: {
        color: theme.palette.text.secondary,
        fontWeight: 400,
        fontSize: 14,
    },
    cardValue: {
        color: theme.palette.text.primary,
    },
    header: {
        fontWeight: 500,
        fontSize: 18,
    },
    detectionCard: {
        backgroundColor: theme.palette.background.default,
    },
}))

export const SecurityPanel = memo<TokenCardProps>(({ tokenSecurity }) => {
    const { classes } = useStyles()
    const t = useI18N()
    const [isFold, setFold] = useState(false)

    const makeMessageList = SecurityMessages.filter(
        (x) => x.condition(tokenSecurity) && x.level !== SecurityMessageLevel.Safe && x.shouldHide(tokenSecurity),
    )

    console.log(makeMessageList)

    const riskyFactors = makeMessageList.filter((x) => x.level === SecurityMessageLevel.High).length
    const attentionFactors = makeMessageList.filter((x) => x.level === SecurityMessageLevel.Medium).length

    const securityMessageLevel = useMemo(() => {
        if (riskyFactors) return SecurityMessageLevel.High
        if (attentionFactors) return SecurityMessageLevel.Medium
        return SecurityMessageLevel.Safe
    }, [riskyFactors, attentionFactors])

    return (
        <Stack spacing={2}>
            <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                    <Stack display="inline-flex" direction="row" alignItems="center" spacing={0.6}>
                        <Typography variant="h6" className={classes.header}>
                            {t.token_info()}
                        </Typography>
                        <KeyboardArrowDownIcon
                            onClick={() => setFold(!isFold)}
                            sx={{ fontSize: 15, cursor: 'pointer' }}
                        />
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography component="span" lineHeight="14px" fontSize={12}>
                            {t.more_details()}
                        </Typography>
                        <Link
                            className={classes.link}
                            lineHeight="14px"
                            href="#"
                            target="_blank"
                            title={t.more_details()}
                            rel="noopener noreferrer">
                            <ExternalLink size={14} />
                        </Link>
                    </Stack>
                </Stack>
                {!isFold && (
                    <Stack>
                        <Stack direction="row" className={classes.card} spacing={2}>
                            <Stack
                                spacing={1.5}
                                borderRadius={0.5}
                                sx={{ background: DefineMapping[securityMessageLevel].bgColor }}
                                width={128}
                                height={128}
                                justifyContent="center"
                                alignItems="center">
                                {DefineMapping[securityMessageLevel].icon(33)}
                                <Typography color={DefineMapping[securityMessageLevel].titleColor} fontSize={14}>
                                    {t[DefineMapping[securityMessageLevel].i18nKey]({ quantity: '' })}
                                </Typography>
                            </Stack>
                            <Stack height={128} justifyContent="space-between" flex={1}>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography className={classes.subtitle}>{t.token_info_token_name()}</Typography>
                                    <Typography className={classes.cardValue}>
                                        {tokenSecurity.token_symbol}({tokenSecurity.token_name})
                                    </Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography className={classes.subtitle}>
                                        {t.token_info_token_contract_address()}
                                    </Typography>
                                    <Typography className={classes.cardValue}>
                                        {formatEthereumAddress(tokenSecurity.contract, 4)}
                                    </Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography className={classes.subtitle}>
                                        {t.token_info_contract_creator()}
                                    </Typography>
                                    <Typography className={classes.cardValue}>
                                        {formatEthereumAddress(tokenSecurity.creator_address ?? '', 4)}
                                    </Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography className={classes.subtitle}>
                                        {t.token_info_contract_owner()}
                                    </Typography>
                                    <Typography className={classes.cardValue}>
                                        {formatEthereumAddress(tokenSecurity.owner_address ?? '', 4)}
                                    </Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography className={classes.subtitle}>{t.token_info_total_supply()}</Typography>
                                    <Typography className={classes.cardValue}>{tokenSecurity.total_supply}</Typography>
                                </Stack>
                            </Stack>
                        </Stack>
                    </Stack>
                )}
            </Stack>
            <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={3.5}>
                    <Typography variant="h6" className={classes.header}>
                        {t.security_detection()}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        {riskyFactors !== 0 && (
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                {DefineMapping[securityMessageLevel].icon(14)}
                                <Typography component="span">
                                    {t.risky_factors({ quantity: riskyFactors.toString() })}
                                </Typography>
                            </Stack>
                        )}
                        {attentionFactors !== 0 && (
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                {DefineMapping[securityMessageLevel].icon(14)}
                                <Typography component="span">
                                    {t.attention_factors({ quantity: attentionFactors.toString() })}
                                </Typography>
                            </Stack>
                        )}
                    </Stack>
                </Stack>
                <Stack spacing={1} maxHeight={isFold ? 402 : 240} sx={{ overflowY: 'scroll' }}>
                    {makeMessageList.map((x, i) => (
                        <RiskCard info={x} key={i} />
                    ))}
                    {(makeMessageList.length || securityMessageLevel === SecurityMessageLevel.Safe) && (
                        <RiskCardUI
                            icon={DefineMapping[SecurityMessageLevel.Safe].icon(14)}
                            title={t.risk_safe_description()}
                            titleColor={DefineMapping[SecurityMessageLevel.Safe].titleColor}
                        />
                    )}
                </Stack>
            </Stack>
        </Stack>
    )
})
