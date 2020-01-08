
const router = require('express').Router();
const clientDb = require('../../service/firestore-adapter');
const { checkAuth } = require('../../service/authentication');
const { CategoryModel } = require('./category.model');
const vldSchema = require('./category.validate');
const { ErrorMsg } = require('../../common/common.model');
const { ERROR_MSG } = require('../../common/constants/server.constant');
const { mapBasicFilter } = require('../../common/helper');


router.get('/', async (req, res) => {
    let result = await getCategory(req.params, req.body)
    .catch(err => {
        res.status(err.code || 500).send(err);
    });
    res.status(200).send(result);
    
});
async function getCategory(params, body) {
    let result = await clientDb.Rest.get(
        'category', {}
    )
    .catch(_ => {throw ERROR_MSG.SERVER_ERROR});
    return {
        data: result.data
    }
}

router.get('/:id', async (req, res) => {
    let result = await getCategoryByID(req.params, req.body)
    .catch(err => {
        res.status(err.code || 500).send(err);
    });
    res.status(200).send(result);
    
});
async function getCategoryByID(params, body) {
    let result = await clientDb.AdminSDK.get('category', params['id'])
    .catch(_ => {throw ERROR_MSG.SERVER_ERROR});
    return {
        data: result.data[0]
    }
}

router.post('/', async (req, res) => {
    let result = await postCategory(req.params, req.body)
    .catch(err => {
        res.status(err.code || 500).send(err);
    });
    res.status(200).send(result);
    
});
async function postCategory(params, body) {
    body = new CategoryModel(body);
    let errorValid = vldSchema.postCategory.validate(body).error;
    if (!errorValid) {
        await clientDb.AdminSDK.post('category', body)
        .catch(_ => {throw ERROR_MSG.SERVER_ERROR})

        return { ok: 1 };
    } else {
        throw new ErrorMsg(400, errorValid.details[0].message);
    }
}

router.put('/:id', async (req, res) => {
    let result = await putCategory(req.params, req.body)
    .catch(err => {
        res.status(err.code || 500).send(err);
    });
    res.status(200).send(result);
    
});
async function putCategory(params, body) {
    body = new CategoryModel(body);
    let errorValid = vldSchema.putCategory.validate(body).error;
    if (!errorValid) {  
        await clientDb.AdminSDK.put('category', params['id'], body)
        .catch(_ => {throw ERROR_MSG.SERVER_ERROR})

        return { ok: 1 };
    } else {
        throw new ErrorMsg(400, errorValid.details[0].message);
    }
}

module.exports = router;