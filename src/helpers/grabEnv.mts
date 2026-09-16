export default (prefix: string) =>
    Object.fromEntries(Object.entries(process.env)
    .filter(entry => entry[0].split('_')[0] === prefix.toUpperCase())
    .map(entry => [entry[0].slice(entry[0].indexOf('_') + 1)
        .split("_").map((word, index) =>
            index !== 0 ?
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        : word.toLowerCase())
        .join(""), entry[1]]))