import { Box, Link, Stack, Typography } from '@mui/material'
import { useI18N } from '../../locales'
import { ExternalLink } from 'react-feather'
import { makeStyles } from '@masknet/theme'
import { memo } from 'react'
import { IconMapping, SecurityMessageType, TokenSecurity } from './Conmmon'

interface TokenCardProps {
    tokenSecurity: TokenSecurity
}

interface SecurityMessage {
    type: SecurityMessageType
    condition(info: TokenSecurity): boolean
    titleKey: keyof ReturnType<typeof useI18N>
    messageKey: keyof ReturnType<typeof useI18N>
}

const SecurityMessages: SecurityMessage[] = [
    {
        type: 'high',
        condition: (info: TokenSecurity) => true,
        titleKey: 'security_info_code_not_verify_title',
        messageKey: 'security_info_code_not_verify_message',
    },
    {
        type: 'medium',
        condition: (info: TokenSecurity) => true,
        titleKey: 'security_info_functions_that_can_suspend_trading_title',
        messageKey: 'security_info_functions_that_can_suspend_trading_message',
    },
]

const useStyles = makeStyles()(() => ({
    root: {
        width: '600px',
    },
    link: {},
}))

export const TokenCard = memo<TokenCardProps>(({ tokenSecurity }) => {
    const { classes } = useStyles()
    const t = useI18N()
    const getSecurityMessageType = (): SecurityMessageType => 'high'

    const makeMessageList = SecurityMessages.filter((x) => x.condition(tokenSecurity))

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
                    {makeMessageList.map((x) => {
                        return (
                            <Stack key={x.titleKey}>
                                <Box>{IconMapping[x.type]}</Box>
                                <Box>
                                    <Typography>{t[x.titleKey]()}</Typography>
                                    <Typography>{t[x.messageKey]()}</Typography>
                                </Box>
                            </Stack>
                        )
                    })}
                </Box>
            </Stack>
        </Stack>
    )
})
