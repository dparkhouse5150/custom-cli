export const replace = (needle, replace) => {
    let temp = needle.split(needle)
    return temp.join(replace)
}

export const replace_reg = (elem, replace) => {
    let r = new RegExp(elem, 'g')
    return elem.replace(r, replace)
}
