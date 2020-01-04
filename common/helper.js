

exports.mapBodyForQueryFilter = function (input) {
    let out = {};
    if (typeof input === 'object' && input !== null) {
        for (key in value) {
            out[key] = mapBodyForQueryFilter(input[key]);
        }
    } else {
        out = {'$eq': input};
    }
    return out;
}