
const serviceAccount = require('./angular-admin-1abb5-firebase-adminsdk-70n21-7f57f36c3f.json');
module.exports = {
    HOST: 'localhost',
    PORT: 3000,
    GOOGLE_SCOPES: ['https://www.googleapis.com/auth/datastore', 'https://www.googleapis.com/auth/cloud-platform'],
    CREDENTIALS: serviceAccount,
    PATH_API: `projects/${serviceAccount.project_id}/databases/(default)/documents`,
    SECRET_KEY: 'A@123456',
    OP_SET: [
        {
            key: '$or',
            value: 'OR',
            isComposite: true
        },
        {
            key: '$and',
            value: 'AND',
            isComposite: true
        },
        {
            key: '$lt',
            value: 'LESS_THAN'
        },
        {
            key: '$lte',
            value: 'LESS_THAN_OR_EQUAL'
        },
        {
            key: '$gt',
            value: 'GREATER_THAN'
        },
        {
            key: '$gte',
            value: 'GREATER_THAN_OR_EQUAL'
        },
        {
            key: '$eq',
            value: 'EQUAL'
        },
        {
            key: '$contain',
            value: 'ARRAY_CONTAINS'
        },
    ],
    ERROR_MSG: {
        SERVER_ERROR: {
            code: 500,
            message: 'Server Error'
        }
    }
}