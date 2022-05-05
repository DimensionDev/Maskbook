import { RightArrowIcon } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import Popover from '@mui/material/Popover'
import { RadioGroup, Radio, Typography } from '@mui/material'
import { useState } from 'react'

const useStyles = makeStyles()((theme) => ({
    popper: {
        overflow: 'visible',
        boxShadow: '0px 0px 16px 0px rgba(101, 119, 134, 0.2)',
        borderRadius: 4,
    },
    popperText: {
        fontSize: 14,
        fontWeight: 700,
        lineHeight: '18px',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        cursor: 'pointer',
    },
    item: {
        display: 'flex',
    },
    divider: {
        width: '100%',
        height: 1,
        background: theme.palette.divider,
        margin: '8px 0',
    },
    mainTitle: {
        color: theme.palette.text.primary,
        fontWeight: 700,
    },
    subTitle: {
        color: theme.palette.text.secondary,
    },
    paper: {
        width: 280,
        padding: 12,
        boxSizing: 'border-box',
    },
    flex: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 4,
        boxSizing: 'border-box',
    },
    create: {
        cursor: 'pointer',
        fontWeight: 700,
        color: theme.palette.primary.main,
    },
}))
interface PopoverListItem {
    type: string
    title: string
    subTitle?: string
    personaRequired?: boolean
    showDivider?: boolean
    hasPersona?: boolean
}
interface PopoverListTriggerProp {
    hasPersona?: boolean
    anchorEl: HTMLElement | null
    setAncorEl(v: HTMLElement | null): void
    onChange(v: string): void
    renderScheme: Array<PopoverListItem>
    selected: string
}

const PopoverListItem = (props: PopoverListItem) => {
    const { title, subTitle, personaRequired, type, showDivider, hasPersona } = props
    const { classes } = useStyles()
    return (
        <>
            <div className={classes.item}>
                <Radio value={type} />
                <div>
                    <Typography className={classes.mainTitle}>{title}</Typography>
                    <Typography className={classes.subTitle}>{subTitle}</Typography>
                </div>
            </div>
            {personaRequired && !hasPersona && (
                <div className={classes.flex}>
                    <Typography className={classes.mainTitle}>Persona required</Typography>
                    <Typography className={classes.create}>Create</Typography>
                </div>
            )}
            {showDivider && <div className={classes.divider} />}
        </>
    )
}
export function PopoverListTrigger({
    anchorEl,
    setAncorEl,
    renderScheme,
    selected,
    onChange,
    hasPersona,
}: PopoverListTriggerProp) {
    const { classes } = useStyles()
    const [selectedValue, setSelectedValue] = useState<string>(selected)
    return (
        <>
            <div
                className={classes.popperText}
                onClick={(e) => {
                    setAncorEl(anchorEl ? null : e.currentTarget)
                }}>
                {renderScheme.find((x) => x.type === selectedValue)?.title}
                <RightArrowIcon />
            </div>
            <Popover
                disablePortal
                className={classes.popper}
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={() => setAncorEl(null)}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}>
                <RadioGroup
                    className={classes.paper}
                    value={selectedValue}
                    onChange={(e) => {
                        const value = e.target.value
                        setSelectedValue(value)
                        onChange(value)
                    }}>
                    {renderScheme.map((x, idx) => {
                        return (
                            <PopoverListItem
                                hasPersona={hasPersona}
                                key={idx}
                                type={x.type}
                                title={x.title}
                                subTitle={x.subTitle}
                                personaRequired={x.personaRequired}
                                showDivider={idx < renderScheme.length - 1}
                            />
                        )
                    })}
                </RadioGroup>
            </Popover>
        </>
    )
}
