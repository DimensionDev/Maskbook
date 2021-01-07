import { Button, ButtonProps, CircularProgress, createStyles, makeStyles, Menu, MenuItem } from '@material-ui/core'
import React, { useState } from 'react'
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'
import { useGasPrice } from '../hooks/useGasPrice'
import { usePortalShadowRoot } from '../../utils/shadow-root/usePortalShadowRoot'
import { useStylesExtends } from '../../components/custom-ui-helper'

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {},
    }),
)

export interface EthereumGasButtonProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    ButtonProps?: Partial<ButtonProps>
}

export function EthereumGasButton(props: EthereumGasButtonProps) {
    const classes = useStylesExtends(useStyles(), props)
    const { loading, value: gasPrices } = useGasPrice()
    const [selectedIndex, setSelectedIndex] = useState(0)
    const { ButtonProps } = props

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

    const handleClickListItem = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget)
    }

    const handleMenuItemClick = (event: React.MouseEvent<HTMLElement>, index: number) => {
        setSelectedIndex(index)
        setAnchorEl(null)
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

    return usePortalShadowRoot((container) => (
        <>
            <Button
                variant="outlined"
                {...ButtonProps}
                endIcon={loading ? null : <ArrowDropDownIcon fontSize="small" />}
                aria-haspopup="true"
                onClick={handleClickListItem}>
                {loading ? (
                    <CircularProgress />
                ) : gasPrices && gasPrices.length > 0 ? (
                    `${gasPrices?.[selectedIndex].gasPrice} | ${gasPrices?.[selectedIndex].title}`
                ) : (
                    'No Data'
                )}
            </Button>
            {gasPrices ? (
                <Menu
                    container={container}
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={handleClose}>
                    {gasPrices?.map((item, index) => (
                        <MenuItem
                            key={index}
                            selected={index === selectedIndex}
                            onClick={(event) => handleMenuItemClick(event, index)}>
                            {`${item.gasPrice} | ${item.title}`}
                        </MenuItem>
                    ))}
                </Menu>
            ) : null}
        </>
    ))
}
