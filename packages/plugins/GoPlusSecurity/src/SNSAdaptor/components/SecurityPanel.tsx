import { Box, Link, Stack, Typography } from '@mui/material'
import { useI18N } from '../../locales'
import { ExternalLink } from 'react-feather'
import { makeStyles } from '@masknet/theme'
import { memo } from 'react'
import { IconMapping, SecurityMessageLevel, TokenSecurity } from './Common'
import { SecurityMessages } from '../rules'
import { RiskCard } from './RiskCard'

interface TokenCardProps {
    tokenSecurity: TokenSecurity
}

const useStyles = makeStyles()(() => ({
    root: {
        width: '600px',
    },
    link: {},
}))

export const SecurityPanel = memo<TokenCardProps>(({ tokenSecurity }) => {
    const { classes } = useStyles()
    const t = useI18N()

    const makeMessageList = SecurityMessages.filter((x) => x.condition(tokenSecurity))

    const getSecurityMessageType = () => {
        if (makeMessageList.find((x) => x.level === SecurityMessageLevel.High)) return SecurityMessageLevel.High
        if (makeMessageList.find((x) => x.level === SecurityMessageLevel.Medium)) return SecurityMessageLevel.Medium
        return SecurityMessageLevel.Safe
    }

    return (
        <Stack>
            <Stack>
                <Stack>
                    <Typography variant="h3">{t.token_info()}</Typography>
                    <Box>
                        <Typography>{t.more_details()}</Typography>
                        <Link
                            className={classes.link}
                            href="#"
                            target="_blank"
                            title={t.more_details()}
                            rel="noopener noreferrer">
                            <ExternalLink size={14} />
                        </Link>
                    </Box>
                </Stack>
                <Stack direction="row">
                    <Box>{IconMapping[getSecurityMessageType()]}</Box>
                    <Box>
                        <Stack direction="row" justifyContent="space-between">
                            <Typography>{t.token_info_token_name()}</Typography>
                            <Typography>{tokenSecurity.contract}</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                            <Typography>{t.token_info_token_contract_address()}</Typography>
                            <Typography>{tokenSecurity.contract}</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                            <Typography>{t.token_info_contract_creator()}</Typography>
                            <Typography>{tokenSecurity.creator_address}</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                            <Typography>{t.token_info_contract_owner()}</Typography>
                            <Typography>{tokenSecurity.owner_address}</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                            <Typography>{t.token_info_total_supply()}</Typography>
                            <Typography>{tokenSecurity.total_supply}</Typography>
                        </Stack>
                    </Box>
                </Stack>
            </Stack>
            <Stack maxHeight={300}>
                <Typography variant="h3">{t.security_detection()}</Typography>
                <Box>
                    {makeMessageList.map((x, i) => (
                        <RiskCard info={x} key={i} />
                    ))}
                </Box>
            </Stack>
        </Stack>
    )
})
