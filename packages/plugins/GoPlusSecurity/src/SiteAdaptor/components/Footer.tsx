import { Box, Link, Stack, Typography } from '@mui/material'
import { GoPlusLabLogo } from '../icons/Logo.js'
import { PLUGIN_OFFICIAL_WEBSITE } from '../../constants.js'
import { Trans } from '@lingui/macro'

export function Footer() {
    return (
        <Stack justifyContent="flex-end" direction="row">
            <Box display="flex" justifyContent="center">
                <Link href={PLUGIN_OFFICIAL_WEBSITE} target="_blank" underline="none" rel="noopener noreferrer">
                    <Stack direction="row" justifyContent="center">
                        <Trans>
                            <Typography
                                fontSize="14px"
                                color={(theme) => theme.palette.maskColor.second}
                                fontWeight="700"
                                marginRight="4px">
                                Powered by
                            </Typography>
                            <Typography
                                fontSize="14px"
                                color={(theme) => theme.palette.maskColor.main}
                                fontWeight="700"
                                marginRight="12px">
                                Go+
                            </Typography>
                        </Trans>
                        <GoPlusLabLogo style={{ width: 24, height: 24 }} />
                    </Stack>
                </Link>
            </Box>
        </Stack>
    )
}
