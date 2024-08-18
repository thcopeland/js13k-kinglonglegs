/**
 * Performs global text replacements.
 */

export default (options) => {
    return {
        name: 'gsub',
        shouldTransformCachedModule: (module) => 
            Object.entries(options).some(([search, subst]) => module.code.includes(search)),  
        transform: (source, id) => {
            Object.entries(options).forEach(([search, subst]) => {
                source = source.replaceAll(new RegExp(`${search}\\W`, "g"), (match) => subst + match[match.length-1])
            })
            return {
                code: source,
                map: null
            }
        }
    }
}
