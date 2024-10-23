import { Icons } from '@masknet/icons'
import { EmptyStatus, LoadingStatus } from '@masknet/shared'
import { EMPTY_LIST } from '@masknet/shared-base'
import { makeStyles, MaskTextField } from '@masknet/theme'
import { alpha, Avatar, Box, Button, Checkbox, Radio, Typography } from '@mui/material'
import Fuse from 'fuse.js'
import { groupBy, sortBy } from 'lodash-es'
import { memo, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTrade } from '../contexts/index.js'
import { useLiquidityResources } from '../hooks/useLiquidityResources.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        minHeight: 0,
        boxSizing: 'border-box',
        gap: theme.spacing(1.5),
    },
    searchInput: {
        padding: theme.spacing(2, 2, 0),
    },
    groups: {
        flexGrow: 1,
        minHeight: 0,
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(1),
        padding: theme.spacing(2, 2, 0),
        scrollbarWidth: 'none',
    },
    statusBox: {
        display: 'flex',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    group: {
        borderRadius: 12,
    },
    groupName: {
        color: theme.palette.maskColor.second,
        marginBottom: theme.spacing(1),
        paddingLeft: theme.spacing(0.5),
        fontSize: 14,
    },
    liquidityList: {
        display: 'flex',
        flexDirection: 'column',
    },
    liquidity: {
        display: 'flex',
        cursor: 'pointer',
        alignItems: 'center',
        gap: theme.spacing(0.5),
        padding: theme.spacing(0.5),
    },
    liquidityName: {
        fontWeight: 700,
        color: theme.palette.maskColor.main,
        lineHeight: '18px',
        fontSize: 14,
    },
    control: {
        padding: 0,
    },
    footer: {
        boxSizing: 'content-box',
        display: 'flex',
        gap: theme.spacing(1.5),
        backgroundColor: alpha(theme.palette.maskColor.bottom, 0.8),
        boxShadow:
            theme.palette.mode === 'dark' ?
                '0px 0px 20px rgba(255, 255, 255, 0.12)'
            :   '0px 0px 20px rgba(0, 0, 0, 0.05)',
        backdropFilter: 'blur(16px)',
        padding: theme.spacing(2),
        borderRadius: '0 0 12px 12px',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1,
        maxHeight: 40,
    },
    selectAll: {
        display: 'flex',
        cursor: 'pointer',
        alignItems: 'center',
        gap: theme.spacing(1),
        fontWeight: 700,
        fontSize: 14,
        flexShrink: 0,
        flexGrow: 1,
        color: theme.palette.maskColor.main,
    },
}))

export const SelectLiquidity = memo(function SelectLiquidity() {
    const { classes, theme } = useStyles()
    const navigate = useNavigate()
    const { chainId, disabledDexIds, setDisabledDexIds } = useTrade()
    const [pendingDisabledDexIds, setPendingDisabledDexIds] = useState<string[]>(disabledDexIds)
    const [keyword, setKeyword] = useState('')
    const { data: liquidityList = EMPTY_LIST, isLoading } = useLiquidityResources(chainId)
    const isSelectedAll = pendingDisabledDexIds.length === 0

    const fuse = useMemo(() => {
        return new Fuse(liquidityList, {
            shouldSort: true,
            isCaseSensitive: false,
            threshold: 0.45,
            minMatchCharLength: 1,
            keys: ['name'],
        })
    }, [liquidityList])

    const liquidityGroups = useMemo(() => {
        const items = keyword ? fuse.search(keyword).map((r) => r.item) : liquidityList
        const groups = groupBy(items, (x) => {
            return x.name.match(/^\d/) ? '0-9' : x.name.charAt(0).toUpperCase()
        })
        return sortBy(Object.entries(groups), (x) => x[0])
    }, [liquidityList, fuse, keyword])

    const handleClear = () => {
        setKeyword('')
    }

    const remains =
        pendingDisabledDexIds.length ?
            liquidityList.filter((x) => !pendingDisabledDexIds.includes(x.id))
        :   liquidityList

    return (
        <div className={classes.container}>
            <Box className={classes.searchInput}>
                <MaskTextField
                    value={keyword}
                    placeholder="Search"
                    autoFocus
                    fullWidth
                    InputProps={{
                        style: { height: 40 },
                        inputProps: { style: { paddingLeft: 4 } },
                        startAdornment: <Icons.Search size={18} />,
                        endAdornment: keyword ? <Icons.Close size={18} onClick={handleClear} /> : null,
                    }}
                    onChange={(e) => {
                        setKeyword(e.currentTarget.value)
                    }}
                />
            </Box>
            <div className={classes.groups}>
                {isLoading ?
                    <div className={classes.statusBox}>
                        <LoadingStatus />
                    </div>
                : !liquidityGroups.length ?
                    <div className={classes.statusBox}>
                        <EmptyStatus />
                    </div>
                :   liquidityGroups.map(([name, list]) => {
                        return (
                            <div className={classes.group} key={name}>
                                <Typography className={classes.groupName}>{name}</Typography>
                                <div className={classes.liquidityList}>
                                    {list.map((liquidity) => (
                                        <label className={classes.liquidity} key={liquidity.id}>
                                            <Checkbox
                                                classes={{ root: classes.control }}
                                                size="small"
                                                color="primary"
                                                checked={!pendingDisabledDexIds.includes(liquidity.id)}
                                                icon={<Icons.CheckboxBlank size={20} />}
                                                checkedIcon={
                                                    <Icons.Checkbox
                                                        sx={{
                                                            '--stroke-color': theme.palette.maskColor.bottom,
                                                        }}
                                                        color={theme.palette.maskColor.main}
                                                        size={20}
                                                    />
                                                }
                                                onChange={(event) => {
                                                    if (event.currentTarget.checked) {
                                                        setPendingDisabledDexIds((ids) =>
                                                            ids.filter((id) => id !== liquidity.id),
                                                        )
                                                    } else {
                                                        setPendingDisabledDexIds((ids) => [...ids, liquidity.id])
                                                    }
                                                }}
                                            />
                                            <Avatar
                                                src={liquidity.logo}
                                                sx={{ width: 24, height: 24, margin: '2px' }}
                                            />
                                            <Typography className={classes.liquidityName}>{liquidity.name}</Typography>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )
                    })
                }
            </div>
            <div className={classes.footer}>
                <label className={classes.selectAll}>
                    <Radio
                        classes={{ root: classes.control }}
                        onClick={() => {
                            setPendingDisabledDexIds(isSelectedAll ? liquidityList.map((x) => x.id) : EMPTY_LIST)
                        }}
                        checked={isSelectedAll}
                        icon={<Icons.RadioButtonUnChecked size={18} color={theme.palette.maskColor.main} />}
                        checkedIcon={
                            <Icons.RadioButtonChecked
                                size={18}
                                color={theme.palette.maskColor.main}
                                sx={{ '--stroke-color': theme.palette.maskColor.bottom }}
                            />
                        }
                    />
                    <Typography>Select all</Typography>
                </label>
                <Box flexGrow={1}>
                    <Button
                        fullWidth
                        disabled={!remains.length}
                        onClick={() => {
                            setDisabledDexIds(pendingDisabledDexIds)
                            navigate(-1)
                        }}>
                        <Trans>Confirm</Trans>
                    </Button>
                </Box>
            </div>
        </div>
    )
})
