/**
 * Performs global text replacements.
 */

export default (options) => {
    return {
        name: 'gsub',
        transform: (source, id) => {
            Object.entries(options).forEach(([search, subst]) => {
                source = source.replaceAll(search + /\W/g, (match) => subst + match[match.length-1])
            })
            return {
                code: source,
                map: null
            }
        }
    }
}
