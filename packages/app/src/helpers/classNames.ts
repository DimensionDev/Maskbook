/**
 * Combine multiple class names and conditionally include them based on the provided conditions.
 * @param classes - An array or object where keys are class names and values are boolean conditions to include each class.
 * @returns A string containing the combined class names.
 */
export function classNames(...classes: Array<string | Record<string, boolean>>): string {
    // Filter the provided classes based on their type
    const filteredClasses = classes.filter(Boolean)

    // Process each class based on its type (string or object)
    const combinedClasses = filteredClasses.map((item) => {
        if (typeof item === 'string') {
            // For string class names, return the class as is
            return item
        } else if (typeof item === 'object') {
            // For object class names, filter the keys based on their corresponding values (truthy values are included)
            return Object.keys(item)
                .filter((key) => item[key])
                .join(' ')
        }
        return '' // Invalid type, return an empty string
    })

    // Join the processed class names into a single string
    return combinedClasses.join(' ')
}
