

exports.mapBasicFilter = function (input) {
    let out;
    if (
        typeof input === 'object' &&
        input !== null &&
        !Array.isArray(input)
    ) {
        out = {$and: []};
        for (let key in input) {
            out.$and.push({ [key]: { '$eq': input[key] } })
        }
    }
    return out;
}