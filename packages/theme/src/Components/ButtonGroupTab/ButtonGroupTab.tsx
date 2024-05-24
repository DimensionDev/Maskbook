import { Button, type ButtonProps, styled } from '@mui/material'

const TabButtonWrap = styled(Button)(({ theme }) => ({
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    flex: 1,
}))
interface ButtonTabProps extends React.PropsWithChildren<Omit<ButtonProps, 'onChange' | 'value' | 'selected'>> {
    value: string
    selected?: boolean
    onChange?(event: object, value: string): void
}
/**
 * This is an alternative implementation of Tab component.
 */
export function ButtonTab(props: ButtonTabProps) {
    const activated = !!props.selected
    const { onChange, onClick, value } = props

    const handleClick = (event: any) => {
        if (!activated && onChange) onChange(event, String(value))
        if (onClick) onClick(event)
    }
    // TODO: replace secondary to correct theme color
    return (
        <TabButtonWrap
            role="tab"
            {...props}
            disableElevation
            variant="contained"
            color={activated ? 'primary' : 'secondary'}
            aria-selected={activated}
            onClick={handleClick}
            onChange={undefined}
        />
    )
}
