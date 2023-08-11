import { useCallback, useState } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

export interface SearchBoxProps {
    onChange: (keyword: string) => void
}

export function SearchBox(props: SearchBoxProps) {
    const { onChange } = props
    const [keyword, setKeyword] = useState('')

    const onFocus = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        e.target.select()
    }, [])

    const handleKeywordChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const newKeyword = e.target.value
            setKeyword(newKeyword)
            onChange(newKeyword) // Invoke the onChange prop when the keyword changes
        },
        [onChange],
    )

    return (
        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <label htmlFor="search-field" className="sr-only">
                Search
            </label>
            <div className="relative w-full">
                <MagnifyingGlassIcon
                    className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-black dark:text-white"
                    aria-hidden="true"
                />
                <input
                    id="search-field"
                    className="dark:bg-black bg-white block h-full w-full border-0 bg-transparent py-0 pl-8 pr-0 dark:text-white text-black focus:ring-0 sm:text-sm"
                    placeholder="eg: Twitter accounts, Persona public keys, wallet addresses or ENS"
                    type="search"
                    name="search"
                    onFocus={onFocus}
                    onChange={handleKeywordChange}
                    value={keyword}
                    autoComplete="off"
                />
            </div>
        </div>
    )
}
