import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { memo } from 'react'

const ChromeIcon = new URL('../assets/chrome.png', import.meta.url)
const FirefoxIcon = new URL('../assets/firefox.png', import.meta.url)
const OperaIcon = new URL('../assets/opera.png', import.meta.url)

const useStyles = makeStyles()((theme) => ({
    image: {
        width: 20,
        height: 20,
    },
}))
export const InstallExtension = memo(() => {
    const { classes } = useStyles()

    return (
        <a role="button" className="flex flex-1 w-full" href="https://mask.io/download-links">
            <div className="flex flex-1 items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 dark:text-white text-black border-y dark:border-line-dark  border-line-light dark:bg-gray-800 dark:text-white bg-gray-50">
                <div className="text-gray-700 dark:text-gray-400 flex justify-between flex-1">
                    <Typography className="flex flex-1">Install Extension</Typography>
                    <div className="flex">
                        <img src={ChromeIcon.toString()} className={classes.image} />
                        <img src={FirefoxIcon.toString()} className={classes.image} />
                        <img src={OperaIcon.toString()} className={classes.image} />
                    </div>
                </div>
            </div>
        </a>
    )
})
