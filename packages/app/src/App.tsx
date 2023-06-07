import { useState } from 'react'
import { ExampleDialog, Modals } from '@masknet/shared'

export function App() {
    const [email, setEmail] = useState('')
    return (
        <div className="bg-white py-16 sm:py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="max-w-2xl text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                    <h2 className="inline sm:block">Want product news and updates?</h2>{' '}
                    <p className="inline sm:block">Sign up for our newsletter.</p>
                </div>
                <form className="mt-10 max-w-md">
                    <div className="flex gap-x-4">
                        <label htmlFor="email-address" className="sr-only">
                            Email address
                        </label>
                        <input
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="min-w-0 flex-auto rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(ev) => setEmail(ev.currentTarget.value ?? '')}
                        />
                        <button
                            type="button"
                            className="flex-none rounded-md bg-blue-600 py-2.5 px-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:bg-gray-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                            disabled={!email}
                            onClick={async () => {
                                try {
                                    await ExampleDialog.openAndWaitForClose({
                                        email,
                                    })

                                    setEmail('')
                                } catch (error) {
                                    if (error instanceof Error) {
                                        // eslint-disable-next-line no-alert
                                        alert(error.message)
                                    }
                                }
                            }}>
                            Subscribe
                        </button>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-gray-900">
                        We care about your data. Read our{' '}
                        <a href="#" className="font-semibold text-blue-600 hover:text-blue-500">
                            privacy&nbsp;policy
                        </a>
                        .
                    </p>
                </form>
            </div>
            <Modals />
        </div>
    )
}
