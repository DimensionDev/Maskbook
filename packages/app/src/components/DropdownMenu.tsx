import { Fragment, useState, useRef, useEffect } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { classNames } from '../helpers/classNames.js'

export interface DropdownMenuItem {
    id: string
    label: string
}

export interface DropdownMenuProps {
    items: DropdownMenuItem[]
    activeItemId: string
    onItemChange: (item: DropdownMenuItem) => void
}

export function DropdownMenu(props: DropdownMenuProps) {
    const [menuOpen, setMenuOpen] = useState(false)
    const menuButtonRef = useRef<HTMLDivElement>(null)

    const handleItemClick = (item: DropdownMenuItem, event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault()
        event.stopPropagation()
        props.onItemChange(item)
        setMenuOpen(false) // Close the menu after selecting an item
    }

    const activeItemLabel = props.items.find((item) => item.id === props.activeItemId)?.label || ''

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (menuButtonRef.current && !menuButtonRef.current.contains(event.target as Node)) {
                setMenuOpen(false) // Close the menu when clicking outside of the component
            }
        }

        document.addEventListener('mousedown', handleOutsideClick)
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick)
        }
    }, [])

    return (
        <Menu as="div" className="relative inline-block text-left">
            <div ref={menuButtonRef}>
                <Menu.Button
                    className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white dark:bg-black px-3 py-2 text-sm font-semibold text-black dark:text-white whitespace-nowrap"
                    onClick={() => setMenuOpen(!menuOpen)}>
                    {activeItemLabel}
                    <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
                </Menu.Button>
            </div>

            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
                show={menuOpen}>
                <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white dark:bg-black shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:border dark:border-neutral-800">
                    <div className="py-1">
                        {props.items.map((item) => (
                            <Menu.Item key={item.id}>
                                {({ active }) => (
                                    <a
                                        href="#"
                                        className={classNames(
                                            'block px-4 py-2 text-sm',
                                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700 dark:text-gray-300',
                                            { 'dark:bg-gray-900 dark:text-white': active },
                                        )}
                                        onClick={(event) => handleItemClick(item, event)}>
                                        {item.label}
                                    </a>
                                )}
                            </Menu.Item>
                        ))}
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    )
}
