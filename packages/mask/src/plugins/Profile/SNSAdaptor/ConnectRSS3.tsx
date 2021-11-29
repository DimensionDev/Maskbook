import Button from './components/Button'
import { COLORS } from './common/variables'
import { useEffect, useState } from 'react'
import RSS3, { IRSS3 } from './common/rss3'
import { useAccount } from '@masknet/plugin-infra'
import { Typography, Link, CircularProgress } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { EthereumAddress } from 'wallet.ts'

const useStyles = makeStyles()((theme) => ({
    msg: {
        color: theme.palette.mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)',
    },
}))

interface ConnectRSS3PageProps {
    isOwnAddress: boolean
}

export function ConnectRSS3Page(props: ConnectRSS3PageProps) {
    const { classes } = useStyles()
    const { isOwnAddress } = props
    const address = useAccount()
    const [isRSS3FileExist, setRSS3FileExist] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isEVMpAddress, setEVMpAddress] = useState(false)

    const oneKeyActivate = async () => {
        setIsLoading(true)
        try {
            if (await RSS3.connect(address)) {
                // Activate RSS3 account
                console.log('Hello RSS3')
            }
            setRSS3FileExist(true)
        } catch (error) {
            console.log(error)
        }
        setIsLoading(false)
    }

    const testAccount = async () => {
        if (EthereumAddress.isValid(address)) {
            setEVMpAddress(true)
            if (!RSS3.isValidRSS3()) {
                const apiUser = RSS3.getAPIUser().persona as IRSS3
                try {
                    await apiUser.files.get(address)
                    await RSS3.setPageOwner(address)
                    setRSS3FileExist(true)
                } catch (error) {
                    setRSS3FileExist(false)
                }
            } else {
                setRSS3FileExist(true)
            }
        }
        setIsLoading(false)
    }

    useEffect(() => {
        testAccount()
        console.log(isRSS3FileExist)
    }, [])

    return (
        <div>
            <link rel="stylesheet" href={new URL('./styles/tailwind.css', import.meta.url).toString()} />
            {isOwnAddress ? (
                <div className="flex flex-col my-8 gap-y-6 items-center justify-center">
                    {isLoading ? (
                        <Button isOutlined={false} color={COLORS.primary} width="w-60" height="h-14">
                            <CircularProgress sx={{ color: 'text.Primary' }} size="1rem" />
                        </Button>
                    ) : isEVMpAddress ? (
                        isRSS3FileExist ? (
                            <div className="flex flex-col my-8 gap-y-6 items-center px-4 justify-center">
                                <div>
                                    <Typography className={classes.msg} variant="h6" gutterBottom>
                                        Congrats! You've successfully connected!{' '}
                                    </Typography>
                                    <Typography className={classes.msg} variant="h6" gutterBottom>
                                        You can view and edit your profile on{' '}
                                        <Link href="https://rss3.bio" target="_blank">
                                            rss3.bio
                                        </Link>
                                    </Typography>
                                </div>
                                <Button
                                    isOutlined={false}
                                    color={COLORS.primary}
                                    fontSize="text-md"
                                    width="w-60"
                                    height="h-12"
                                    text="Go to Profile"
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col my-8 gap-y-6 items-center px-4 justify-center">
                                <Button
                                    isOutlined={false}
                                    color={COLORS.primary}
                                    onClick={oneKeyActivate}
                                    fontSize="text-md"
                                    width="w-60"
                                    height="h-12"
                                    text="One Key Registration"
                                />
                                <div>
                                    <Typography className={classes.msg} variant="body2" gutterBottom>
                                        By clicking the button above, you agree to the{' '}
                                        <Link href="https://rss3.io/#privacy" target="_blank">
                                            privacy policy
                                        </Link>{' '}
                                        provided by{' '}
                                        <Link href="https://rss3.io" target="_blank">
                                            RSS3
                                        </Link>
                                        .
                                    </Typography>
                                    <Typography className={classes.msg} variant="body2">
                                        You may need to prepare your wallet to sign.
                                    </Typography>
                                </div>
                            </div>
                        )
                    ) : (
                        <Typography className={classes.msg} variant="body2">
                            Please connect an Ethereum compatible wallet
                        </Typography>
                    )}
                </div>
            ) : null}
        </div>
    )
}
