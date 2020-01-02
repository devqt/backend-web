const { docRef } = require('./firestore');
const { PATH_API, OP_SET } = require('../common/server-constant');

/** create a object value */
function handleToValueObj(value) {
    if (value === null) return {nullValue: value}
    if (typeof value === 'boolean') return {booleanValue: value}
    if (typeof value === 'string') return {stringValue: value}
    if (typeof value === 'number') return {integerValue: value}
    if (Array.isArray(value)) {
        return {
            arrayValue: {
                values: value.map(e => handleToValueObj(e))
            }
        }
    }
}

function handleFromValueObj(valueObj) {
    let [type, value] = Object.entries(valueObj)[0];
    if (type === 'nullValue') return value;
    if (type === 'booleanValue') return value;
    if (type === 'stringValue') return value;
    if (type === 'integerValue') return parseInt(value);
    if (type === 'arrayValue') {
        return value.values.map(e => handleFromValueObj(e))
    }
}

/** return handled where object */
function handleWhereQuery(filter) {
    let handledW;
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
                        "value": handleToValueObj(value)
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

function transferPostDataReqBody(data) {
    for (let [key, value] of Object.entries(data)) {
        data[key] = handleToValueObj(value);
    }
    return data;
}

function mapResponse(res, rej) {
    return (err, response) => {
        console.log(response);
        err && rej(err);
        let data;
        if (Array.isArray(data)) {
            data = response.data.map(e => {
                let outE = {};
                for ([key, value] of Object.entries(e.document.fields)) {
                    outE[key] = handleFromValueObj(value)
                }
                outE['_id'] = e.document.name.split('/').pop();
                return outE;
            })
        } else {
            for ([key, value] of Object.entries(response.data.fields)) {
                data[key] = handleFromValueObj(value)
            }
            data['_id'] = data.name.split('/').pop(); 
        }
        
        response['data'] = data;
        res(response);
    }
}

module.exports = {
    get(collection, query, options) {
        let {select, from, where, orderBy, offset, limit} = query || {};
        select = select ? {fields: select.map(_=>({'fieldPath': _}))} : undefined;
        from = from? from.map(e => ({collectionId: e})) : [{collectionId: collection}];
        where = {name:{$eq: 'quyjs'}}
        where = handleWhereQuery(where);
        
        return new Promise((res, rej) => {
            docRef.runQuery(
                {
                    parent: PATH_API,
                    requestBody: {
                        structuredQuery: {
                            select: select,
                            from: from,
                            where: where,
                            orderBy: orderBy,
                            offset: offset,
                            limit: limit,
                        }
                    },
                }, 
                mapResponse(res, rej)
            );
        })
    },

    post(collection, data, options) {
        data = data || {};
        return new Promise((res, rej) => {
            docRef.createDocument(
                {
                    parent: PATH_API,
                    collectionId: collection,
                    requestBody: {
                        fields: transferPostDataReqBody(data)
                    }
                },
                mapResponse(res, rej)
            )
        })
    },
    put(collection, data, options) {
        data = data || {};
        return docRef.patch(
            {
                parent: PATH_API,
                collectionId: collection,
                requestBody: {
                    fields: transferPostDataReqBody(data)
                }
            }
        )
    },
}