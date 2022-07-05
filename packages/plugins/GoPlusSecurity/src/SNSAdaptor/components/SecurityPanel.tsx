import { Collapse, Link, Stack, Typography } from '@mui/material'
import { useI18N } from '../../locales'
import { makeStyles } from '@masknet/theme'
import { memo, useMemo, useState } from 'react'
import { DefineMapping, SecurityMessageLevel, TokenSecurity } from './Common'
import { SecurityMessages } from '../rules'
import { RiskCard, RiskCardUI } from './RiskCard'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { useTheme } from '@mui/system'
import { resolveGoLabLink } from '../../utils/helper'
import { TokenPanel } from './TokenPanel'
import { LinkOutIcon } from '@masknet/icons'

interface TokenCardProps {
    tokenSecurity: TokenSecurity
}

const useStyles = makeStyles()((theme) => ({
    header: {
        fontWeight: 500,
        fontSize: 18,
    },
    root: {
        width: '600px',
    },
    detectionCard: {
        backgroundColor: theme.palette.background.default,
    },
    detectionCollection: {
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
}))

const LIST_HEIGHT = {
    min: 154,
    max: 308,
}

export const SecurityPanel = memo<TokenCardProps>(({ tokenSecurity }) => {
    const { classes } = useStyles()
    const t = useI18N()
    const theme = useTheme()

    const [isCollapse, setCollapse] = useState(false)

    const makeMessageList =
        tokenSecurity.is_whitelisted === '1'
            ? []
            : SecurityMessages.filter(
                  (x) =>
                      x.condition(tokenSecurity) &&
                      x.level !== SecurityMessageLevel.Safe &&
                      !x.shouldHide(tokenSecurity),
              ).sort((a) => (a.level === SecurityMessageLevel.High ? -1 : 1))

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
                            onClick={() => setCollapse(!isCollapse)}
                            sx={{ fontSize: 15, cursor: 'pointer' }}
                        />
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography component="span" lineHeight="14px" fontSize={12}>
                            {t.more_details()}
                        </Typography>
                        <Link
                            lineHeight="14px"
                            href={resolveGoLabLink(tokenSecurity.chainId, tokenSecurity.contract)}
                            target="_blank"
                            rel="noopener noreferrer">
                            <LinkOutIcon style={{ color: theme.palette.text.strong, width: 14, height: 14 }} />
                        </Link>
                    </Stack>
                </Stack>
                <Collapse in={!isCollapse}>
                    <TokenPanel tokenSecurity={tokenSecurity} securityMessageLevel={securityMessageLevel} />
                </Collapse>
            </Stack>
            <Stack spacing={1.5} flex={1}>
                <Stack direction="row" alignItems="center" spacing={3.5}>
                    <Typography variant="h6" className={classes.header}>
                        {t.security_detection()}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        {riskyFactors !== 0 && (
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                {DefineMapping[SecurityMessageLevel.High].icon(14)}
                                <Typography component="span">
                                    {riskyFactors > 1
                                        ? t.risky_factors({ quantity: riskyFactors.toString() })
                                        : t.risky_factor({ quantity: riskyFactors.toString() })}
                                </Typography>
                            </Stack>
                        )}
                        {attentionFactors !== 0 && (
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                {DefineMapping[SecurityMessageLevel.Medium].icon(14)}
                                <Typography component="span">
                                    {attentionFactors > 1
                                        ? t.attention_factors({ quantity: attentionFactors.toString() })
                                        : t.attention_factor({ quantity: attentionFactors.toString() })}
                                </Typography>
                            </Stack>
                        )}
                    </Stack>
                </Stack>
                <Collapse
                    in={isCollapse}
                    timeout={{
                        enter: 1200,
                        exit: 10,
                    }}
                    collapsedSize={LIST_HEIGHT.min}
                    className={classes.detectionCollection}
                    sx={{ maxHeight: LIST_HEIGHT.max, overflowY: 'auto' }}>
                    <Stack spacing={1}>
                        {makeMessageList.map((x, i) => (
                            <RiskCard tokenSecurity={tokenSecurity} info={x} key={i} />
                        ))}
                        {(!makeMessageList.length || securityMessageLevel === SecurityMessageLevel.Safe) && (
                            <RiskCardUI
                                icon={DefineMapping[SecurityMessageLevel.Safe].icon(14)}
                                title={t.risk_safe_description()}
                                titleColor={DefineMapping[SecurityMessageLevel.Safe].titleColor}
                            />
                        )}
                    </Stack>
                </Collapse>
            </Stack>
        </Stack>
    )
})
