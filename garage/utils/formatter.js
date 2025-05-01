export function numFormat(num) {
    let str = `${num}`
    if (num < 1000) return str
    let counter = 1
    let tempNum = ""
    for (let i = (str.length - 1); i >= 0; i--) {
        tempNum += counter % 3 == 0 && i > 0 ? `${str[i]} ` : str[i]
        counter++
    }
    let formattedNum = ""
    for (let i = (tempNum.length - 1); i >= 0; i--) formattedNum += tempNum[i]
    return formattedNum
}

export function carNumFormat(str, type = 'auto') { // С версии 1.1.0 не используется
    str = str.toLowerCase()
    switch (type) {
        case 'moto':
            return `${str[0]}${str[1]}${str[2]}${str[3]} ${str[4]}${str[5]}`
        case 'scooter':
            return `${str[0]}${str[1]}${str[2]} ${str[3]}${str[4]}${str[5]}`
        default:
            return `${str[0]} ${str[1]}${str[2]}${str[3]} ${str[4]}${str[5]}`
    }
}

export function validator(str, datatype = 'text', lenlim = false) {
    let newStr = str.toString().trim()
    if (datatype == 'number') newStr = Number.isNaN(parseInt(str)) ? '0' : `${parseInt(str)}`
    else if (datatype == "color") return ((str || '').toString().match(/[0-9a-f]/gi) || []).join('').padEnd(6, '0').slice(0, 6)
    if (lenlim && lenlim > 0) newStr = newStr.substring(0, lenlim)
    return newStr.length == 0 ? '0' : newStr
}