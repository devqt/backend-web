
const { RestDocRef, AdminDbRef } = require('./firestore');
const { DocumentSnapshot } = require('firebase-admin').firestore;
const { PATH_API, OP_SET } = require('../common/constants/server.constant');

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
    if (typeof value === 'object') {
        let outVal = {
            mapValue: {
                fields: {}
            }
        }
        for (let [key, val] of Object.entries(value)) {
            outVal.mapValue.fields[key] = handleToValueObj(val);
        }
        return outVal;
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
    if (type === 'mapValue') {
        let outVal = {}
        for (let [key, val] of Object.entries(value.fields)) {
            outVal[key] = handleFromValueObj(val);
        }
        return outVal;
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
            if (OP_SET.map(_ => _.key).includes(key)) {
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

function transferReqBody(data) {
    for (let [key, value] of Object.entries(data)) {
        data[key] = handleToValueObj(value);
    }
    return data;
}

function transferPutDataForAdminDb(data, parentKey) {
    let out;
    if (typeof data === 'object' && data !== null) {
        out = {};
        for (let key in data) {
            out = Object.assign(out, transferPutDataForAdminDb(data[key], parentKey ? parentKey + '.' + key : key));
        }
    } else {
        out = {
            [parentKey]: data
        }
    }
    
    return out;
}

function mapResponse(res, rej) {
    return (err, response) => {
        console.log({...response});
        if (err) {
            rej(err);
            return;
        }

        let data;
        if (Array.isArray(response.data)) {
            if (response.data.length === 1 &&
                !response.data[0].document) {
                    /** do nothing */
            } else {
                data = response.data.map(e => {
                    let outE = {};
                    for ([key, value] of Object.entries(e && e.document && e.document.fields || {})) {
                        outE[key] = handleFromValueObj(value)
                    }
                    outE['_id'] = e && e.document && e.document.name && e.document.name.split('/').pop();
                    return outE;

                })
            }
        } else if (response.data instanceof Object) {
            data = {};
            for ([key, value] of Object.entries(response.data.fields || {})) {
                data[key] = handleFromValueObj(value)
            }
            data['_id'] = response.data.name.split('/').pop();
        }
        response.originData = response.data;
        response.data = data;
        res(response);
    }
}
function mapResponseForAdminDb(res, rej) {
    return [
        (response) => {
            if (response instanceof DocumentSnapshot) {
                response.data = response.data();
                res(response);
                return;
            }
            res(response);
        },
        (err) => {
            rej(err);
        },

    ]
}

module.exports = {
    AdminSDK: {
        get(collection, documentId, query, options) {
            let {select} = query;
            select = select || [];
            return new Promise((res, rej) => {
                AdminDbRef.collection(collection).doc(documentId).get().select(...select).then(...mapResponseForAdminDb(res, rej));
            })
        },
        post(collection, data, options) {
            data = data || {};
            data = JSON.parse(JSON.stringify(data));
            return new Promise((res, rej) => {
                AdminDbRef.collection(collection).add(data).then(...mapResponseForAdminDb(res, rej));
            })
        },
        batchPost(collection, data, options) {
            data = data || [];
            let batch = AdminDbRef.batch();
            data.forEach(element => {
                batch.create(AdminDbRef.collection(collection).doc(), element);
            });
            return new Promise((res, rej) => {
                batch.commit().then(...mapResponseForAdminDb(res, rej));
            })
        },
        put(collection, documentId, data, options) {
            data = data || {};
            data = JSON.parse(JSON.stringify(data));
            return new Promise((res, rej) => {
                AdminDbRef.collection(collection).doc(documentId).update(transferPutDataForAdminDb(data)).then(...mapResponseForAdminDb(res, rej))
            });
        },
        delete(collection, documentId, options) {
            return new Promise((res, rej) => {
                AdminDbRef.collection(collection).doc(documentId).delete().then(...mapResponseForAdminDb(res, rej))
            });
        },
    },
    
    Rest: {
        get(collection, query, options) {
            let { select, from, where, orderBy, offset, limit } = query || {};
            select = select ? { fields: select.map(_ => ({ 'fieldPath': _ })) } : undefined;
            from = from ? from.map(e => ({ collectionId: e })) : [{ collectionId: collection }];
            where = handleWhereQuery(where);

            return new Promise((res, rej) => {
                RestDocRef.runQuery(
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
                RestDocRef.createDocument(
                    {
                        parent: PATH_API,
                        collectionId: collection,
                        requestBody: {
                            fields: transferReqBody(data)
                        }
                    },
                    mapResponse(res, rej)
                )
            })
        },

        put(collection, documentId, data, options) {
            data = data || {};
            return new Promise((res, rej) => {
                RestDocRef.patch(
                    {
                        name: `${PATH_API}/${collection}/${documentId}`,
                        "mask.fieldPaths": [],
                        "updateMask.fieldPaths": [],
                        requestBody: {
                            fields: transferReqBody(data)
                        }
                    },
                    mapResponse(res, rej)
                )
            });
        },

        delete(collection, documentId, options) {
            data = data || {};
            return new Promise((res, rej) => {
                RestDocRef.delete(
                    {
                        name: `${PATH_API}/${collection}/${documentId}`
                    },
                    mapResponse(res, rej)
                )
            });
        },
    },
    
}