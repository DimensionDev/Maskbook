import { memo } from 'react'

const ChromeIcon = new URL('../assets/chrome.png', import.meta.url)
const FirefoxIcon = new URL('../assets/firefox.png', import.meta.url)
const OperaIcon = new URL('../assets/opera.png', import.meta.url)

export const InstallExtension = memo(() => {
    return (
        <a role="button" className="flex flex-1 w-full" href="https://mask.io/download-links">
            <div className="flex flex-1 items-center gap-x-4 px-6 py-3 text-sm leading-6 border-y dark:border-neutral-800 border-line-light">
                <div className="flex justify-between flex-1">
                    <p className="flex flex-1 text-sm text-gray-700 dark:text-gray-400">Install Extension</p>
                    <div className="flex">
                        <img className="mr-1 w-[20px] h-[20px]" src={ChromeIcon.toString()} alt="Google Chrome" />
                        <img className="mr-1 w-[20px] h-[20px]" src={FirefoxIcon.toString()} alt="Firefox" />
                        <img className="w-[20px] h-[20px]" src={OperaIcon.toString()} alt="Opera" />
                    </div>
                </div>
            </div>
        </a>
    )
})
