import { Typography, Button, Box, makeStyles } from '@material-ui/core'
import type { Dispatch, SetStateAction, SyntheticEvent } from 'react'

const useStyles = makeStyles((theme) => ({
    priceText: {
        fontSize: '16px',
        lineHeight: '19px',
        fontFamily: 'Inter',
    },
    button: {
        backgroundColor: '#3045B4',
        borderRadius: '12px',
        width: '70px',
        height: '37px',
    },
    buttonText: {
        color: '#EEEEEE',
        fontWeight: 'bold',
        fontSize: '16px',
        lineHeight: '19px',
    },
}))

interface ListedProps {
    username: string
    rank: number
    price: string
    dayChange: number
    setExtendedHover: Dispatch<SetStateAction<boolean>>
}

export default function Listed(props: ListedProps) {
    const classes = useStyles()
    function clicked(e: SyntheticEvent<HTMLButtonElement>) {
        e.preventDefault()
        window.open(`https://ideamarket.io/i/twitter/${props.username}`, '_blank', 'noopener')
    }

    return (
        <Box
            boxShadow="0px 0px 4px 1px rgba(0, 0, 0, 0.25)"
            width={190}
            height={59}
            overflow="hidden"
            zIndex={1}
            boxSizing="border-box">
            <Box
                onMouseEnter={() => props.setExtendedHover(true)}
                onMouseLeave={() =>
                    setTimeout(() => {
                        props.setExtendedHover(false)
                    }, 200)
                }
                component="div"
                boxSizing="border-box"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                paddingY={1.375}
                paddingX={3.25}
                width="100%"
                height="100%"
                bgcolor="#F7F7F7"
                borderRadius={0.8}
                marginRight={'10%'}>
                <Box
                    component="div"
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    color="#58636B"
                    width="50%">
                    <Typography color="inherit" className={classes.priceText}>
                        ${props.price}
                    </Typography>
                </Box>
                <Box component="div" display="flex" justifyContent="space-between" alignItems="center" width="50%">
                    <Button className={classes.button} onClick={clicked}>
                        <Typography className={classes.buttonText}>Buy</Typography>
                    </Button>
                </Box>
            </Box>
        </Box>
    )
}
