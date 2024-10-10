import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { Box, Typography, type BoxProps } from '@mui/material'
import { forwardRef, memo } from 'react'
import { NetworkOptions, Networks } from '../constants.js'
import { useFilters } from './filters.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    button: {
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(0.5, 1),
        height: 24,
        boxSizing: 'border-box',
        borderRadius: 8,
        gap: theme.spacing(0.5),
        border: `1px solid ${theme.palette.maskColor.secondaryLine}`,
        cursor: 'pointer',
        fontSize: 13,
        fontFamily: 'Helvetica',
        lineHeight: '18px',
    },
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: theme.spacing(1.5),
        boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.05)',
        backdropFilter: 'blur(8px)',
    },
    networks: {
        display: 'flex',
        gap: theme.spacing(1, 1.5),
        flexWrap: 'wrap',
    },
}))

export const FeedFilters = memo(
    forwardRef<HTMLDivElement, BoxProps>(function FeedFilters(props: BoxProps, ref) {
        const { classes, cx } = useStyles()

        const [filters, setFilters] = useFilters()
        const { networks, isDirect } = filters

        return (
            <Box {...props} ref={ref} className={cx(classes.container, props.className)}>
                <Box className={classes.header}>
                    <Typography fontWeight="bold">
                        <Trans>{networks.length} Networks</Trans>
                    </Typography>
                    <Box
                        className={classes.button}
                        onClick={() => {
                            setFilters((origin) => ({ ...origin, isDirect: !origin.isDirect }))
                        }}>
                        <Icons.Blocks size={16} />
                        {isDirect ?
                            <Trans>Direct</Trans>
                        :   <Trans>Related</Trans>}
                    </Box>
                </Box>
                <Box className={classes.networks}>
                    {NetworkOptions.map((op) => {
                        if (op.hidden) return null
                        const checked = networks.includes(op.network)
                        return (
                            <Typography
                                key={op.network}
                                className={classes.button}
                                onClick={() => {
                                    setFilters((origin) => ({
                                        ...origin,
                                        networks: Networks.filter((x) =>
                                            op.network === x ? !checked : networks.includes(x),
                                        ),
                                    }))
                                }}>
                                {checked ?
                                    <Icons.Check size={16} />
                                :   <Icons.Minus size={16} />}
                                <span>{op.name}</span>
                            </Typography>
                        )
                    })}
                </Box>
            </Box>
        )
    }),
)
