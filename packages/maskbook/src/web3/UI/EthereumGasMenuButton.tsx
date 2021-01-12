import { Button, ButtonProps, CircularProgress, createStyles, makeStyles, Menu, MenuItem } from '@material-ui/core'
import React, { useState } from 'react'
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'
import { useGasPrices } from '../hooks/useGasPrices'
import { usePortalShadowRoot } from '../../utils/shadow-root/usePortalShadowRoot'
import { useStylesExtends } from '../../components/custom-ui-helper'

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {},
    }),
)

export interface EthereumGasMenuButtonProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    ButtonProps?: Partial<ButtonProps>
    onChange?: (price?: string) => void
}

export function EthereumGasMenuButton(props: EthereumGasMenuButtonProps) {
    const classes = useStylesExtends(useStyles(), props)
    const { loading, value: gasPrices } = useGasPrices()
    const [selectedIndex, setSelectedIndex] = useState(0)
    const { ButtonProps, onChange } = props

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

    const handleClickListItem = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget)
    }

    const handleMenuItemClick = (event: React.MouseEvent<HTMLElement>, index: number) => {
        if (selectedIndex !== index) {
            onChange?.(gasPrices?.[selectedIndex].gasPrice)
            setSelectedIndex(index)
        }

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
                    <CircularProgress size="1.5rem" />
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
