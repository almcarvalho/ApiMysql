const onlyNumber = (value) => {
    return String(value).replace(/[^\d]/g, '');
}

module.exports = {
    onlyNumber
}