import React from 'react'
import { IconButton, IconButtonProps, makeStyles, createStyles, Theme } from '@material-ui/core'
import { getUrl } from '../../utils/utils'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        icon: {
            width: theme.spacing(2),
            height: theme.spacing(2),
        },
    }),
)

export interface TransferButtonProps extends IconButtonProps {}

export function TransferButton({ ...props }: TransferButtonProps) {
    const classes = useStyles()
    return (
        <IconButton color="default" {...props}>
            <svg
                className={classes.icon}
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M15.9241 6.38303C15.9998 6.20026 16.0196 5.99913 15.981 5.80511C15.9424 5.61108 15.847 5.43287 15.7071 5.29303L10.7071 0.29303L9.29312 1.70703L12.5861 5.00003H0.000115853V7.00003H15.0001C15.1979 7.00008 15.3912 6.94149 15.5557 6.83166C15.7202 6.72184 15.8484 6.56572 15.9241 6.38303V6.38303ZM0.0761161 9.61703C0.000411265 9.7998 -0.0193799 10.0009 0.019247 10.195C0.057874 10.389 0.153183 10.5672 0.293116 10.707L5.29312 15.707L6.70712 14.293L3.41412 11H16.0001V9.00003H1.00012C0.80232 8.99985 0.608922 9.05839 0.444428 9.16823C0.279935 9.27807 0.15175 9.43427 0.0761161 9.61703V9.61703Z"
                    fill="black"
                />
            </svg>
        </IconButton>
    )
}
