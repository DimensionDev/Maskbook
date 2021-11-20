import Button from './components/Button'
import { COLORS } from './common/variables'
import { useEffect, useState } from 'react'
import RSS3, { IRSS3 } from './common/rss3'
import { useAccount } from '@masknet/plugin-infra'

interface ConnectRSS3PageProps {}
export function ConnectRSS3Page(props: ConnectRSS3PageProps) {
    const address = useAccount()
    const [isRSS3FileExist, setIsRSS3FileExist] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isEVMpAddress, setIsEVMpAddress] = useState(false)

    const oneKeyActivate = async () => {
        setIsLoading(true)
        try {
            if (await RSS3.connect(address)) {
                // Activate RSS3 account
                console.log('Hello RSS3')
            }
            setIsRSS3FileExist(true)
        } catch (error) {
            console.log(error)
        }
        setIsLoading(false)
    }

    const testAccount = async () => {
        if (address.length === 42 && address.startsWith('0x')) {
            setIsEVMpAddress(true)
            if (!RSS3.isValidRSS3()) {
                const apiUser = RSS3.getAPIUser().persona as IRSS3
                try {
                    await apiUser.files.get(address)
                    await RSS3.setPageOwner(address)
                    setIsRSS3FileExist(true)
                } catch (error) {
                    setIsRSS3FileExist(false)
                }
            } else {
                setIsRSS3FileExist(true)
            }
        }
        setIsLoading(false)
    }

    useEffect(() => {
        testAccount()
    }, [])

    return (
        <div>
            <link rel="stylesheet" href={new URL('./styles/tailwind.css', import.meta.url).toString()} />
            <div className="flex flex-col my-8 gap-y-6 mx-14 items-center justify-center">
                {isLoading ? (
                    <Button isOutlined={false} color={COLORS.primary} icon="loading" width="w-60" height="h-14" />
                ) : isEVMpAddress ? (
                    isRSS3FileExist ? (
                        <Button isOutlined={false} color={COLORS.account} fontSize="text-md" width="w-60" height="h-14">
                            <div>
                                <p>All done!</p>
                                <p>Click to edit your profile on RSS3.Bio</p>
                            </div>
                        </Button>
                    ) : (
                        <>
                            <Button
                                isOutlined={false}
                                color={COLORS.primary}
                                onClick={oneKeyActivate}
                                fontSize="text-md"
                                width="w-60"
                                height="h-14"
                                text="One Key Registration"
                            />
                            <p>
                                By clicking the button above, you agree to the
                                <a className="mx-1 text-primary" href="https://rss3.io/#privacy" target="_blank">
                                    privacy policy
                                </a>
                                provided by
                                <a className="mx-1 text-primary" href="https://rss3.io" target="_blank">
                                    RSS3
                                </a>
                                .
                            </p>
                            <p className="text-primary">You may need to prepare your wallet to sign.</p>
                        </>
                    )
                ) : (
                    <p>Please connect an Ethereum compatible wallet</p>
                )}
            </div>
        </div>
    )
}
