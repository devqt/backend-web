const { docRef } = require('./firestore');
const { PATH_API, OP_SET } = require('../common/server-constant');



a = {
    $or: [
        {age: {$eq: 10}},
        {age: {$eq: 20}},
    ]
    
}
function handleValueOjb(value) {
    if (value === null) return {nullValue: value}
    if (typeof value === 'boolean') return {booleanValue: value}
    if (typeof value === 'string') return {stringValue: value}
    if (typeof value === 'number') return {integerValue: value}
    if (Array.isArray(value)) {
        return {
            values: value.map(e => handleValueOjb(e))
        }
    }
}
function handleWhereQuery(filter) {
    let handledW = {};
    if (typeof filter === 'object') {
        if (Array.isArray(filter)) {
            handledW = filter.map(e => handleWhereQuery(e));
        } else {
            let [key, value] = Object.entries(filter)[0];
            if (OP_SET.map(_=>_.key).includes(key)) {
                if (OP_SET.find(_ => _.key === key).isComposite) {

                    handledW = {
                        compositeFilter: {
                            "op": OP_SET.find(_ => _.key === key).value,
                            "filters": handleWhereQuery(value)
                        }
                    }
                } else {
                    handledW = {
                        "op": OP_SET.find(_ => _.key === key).value,
                        "value": handleValueOjb(value)
                    }
                }
            } else {
                handledW = {
                    "fieldFilter": {
                        "field": {
                            "fieldPath": key
                        },
                        ...handleWhereQuery(value)
                    }
                }
            }
        }
    }
    return handledW;
}
module.exports = {
    get(endPath, query) {
        let {select, from, where, orderBy, offset, limit} = query || {};
        from = from? from.map(e => ({collectionId: e})) : undefined;
        where = a
        where = handleWhereQuery(where);
        console.log(where);
        
        return docRef.runQuery(
            {
                parent: PATH_API + endPath,
                requestBody: {
                    structuredQuery: {
                        select: { fields: select || [] },
                        from: from,
                        where: where,
                        orderBy: orderBy,
                        offset: offset,
                        limit: limit,
                    }
                },
            }
        );
    }
}