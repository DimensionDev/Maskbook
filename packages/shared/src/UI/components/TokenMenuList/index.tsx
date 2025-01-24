import { isEqual } from 'lodash-es'
import { Icons } from '@masknet/icons'
import type { Web3Helper } from '@masknet/web3-helpers'
import { TokenIcon } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { RadioButtonUnchecked as RadioButtonUncheckedIcon } from '@mui/icons-material'
import { MenuItem, Stack, Typography } from '@mui/material'
import { useTheme } from '@mui/system'

const useStyles = makeStyles()((theme) => ({
    menuItem: {
        display: 'flex',
        overflow: 'hidden',
        alignItems: 'center',
        height: 36,
        padding: '0 12px',
    },
    itemText: {
        flexDirection: 'row',
        flexGrow: 1,
        justifyContent: 'space-around',
        gap: theme.spacing(1),
        alignItems: 'center',
        overflow: 'hidden',
    },
    itemCheckout: {
        display: 'flex',
        alignItems: 'center',
    },
    rank: {
        marginRight: 4,
    },
    name: {
        textOverflow: 'ellipsis',
        overflow: 'hidden',
    },
    symbol: {
        marginLeft: theme.spacing(0.5),
    },
    coinIcon: {
        marginRight: 4,
    },
    checkedIcon: {
        filter: 'drop-shadow(0px 4px 10px rgba(28, 104, 243, 0.2))',
        color: theme.palette.maskColor.primary,
    },
}))

export interface TokenMenuListProps {
    options: Web3Helper.TokenResultAll[]
    currentOption?: Web3Helper.TokenResultAll
    onSelect(value: Web3Helper.TokenResultAll, index: number): void
    fromSocialCard?: boolean
}

export function TokenMenuList({ options, currentOption, onSelect, fromSocialCard = false }: TokenMenuListProps) {
    const { classes } = useStyles()
    const theme = useTheme()
    return (
        <>
            {options.map((x, i) => {
                const selected = isEqual(x, currentOption)
                return (
                    <MenuItem className={classes.menuItem} key={i} onClick={() => onSelect(x, i)}>
                        <TokenIcon
                            className={classes.coinIcon}
                            logoURL={x.logoURL}
                            address={x.address || ''}
                            symbol={x.symbol}
                            size={20}
                            disableBadge
                        />

                        <Stack className={classes.itemText}>
                            <Typography
                                fontSize={14}
                                fontWeight={700}
                                flexGrow={1}
                                overflow="hidden"
                                textOverflow="ellipsis">
                                <span className={classes.name}>{x.name}</span>
                                {x.symbol ?
                                    <span className={classes.symbol}>({x.symbol})</span>
                                :   null}
                            </Typography>
                            <div className={classes.itemCheckout}>
                                {x.rank ?
                                    <Typography
                                        fontSize={14}
                                        fontWeight={700}
                                        flexGrow={1}
                                        overflow="hidden"
                                        className={classes.rank}
                                        textOverflow="ellipsis">
                                        #{x.rank}
                                    </Typography>
                                :   null}
                                {fromSocialCard ?
                                    null
                                : selected ?
                                    <Icons.CheckCircle size={20} className={classes.checkedIcon} />
                                :   <RadioButtonUncheckedIcon
                                        style={{
                                            fontSize: 20,
                                            color: theme.palette.maskColor.secondaryLine,
                                            visibility: 'hidden',
                                        }}
                                    />
                                }
                            </div>
                        </Stack>
                    </MenuItem>
                )
            })}
        </>
    )
}
