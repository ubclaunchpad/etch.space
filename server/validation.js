const validator = require('is-my-json-valid');
const _ = require('lodash');
const logger = require('./logger');

const validateSchema = (input, inputSchema, filterAdditionalProperties = false) => {
    // schemas are usually require()'d json files
    // cloning prevents bugs from lambda caching require()'d objects
    let schema = _.cloneDeep(inputSchema);

    if (Array.isArray(input)) {
        schema = {
            type: 'array',
            items: _.cloneDeep(inputSchema),
            minItems: 1
        };
    }

    if (filterAdditionalProperties) {
        const filter = validator.filter(schema);
        input = filter(input);
    }

    const validate = validator(schema, { verbose: true });

    validate(input);

    if (validate.errors && validate.errors[0]) {
        logger.info(JSON.stringify({
            message: 'event failed validation',
            error: validate.errors[0]
        }));
        return false;
    }

    return true;
};

module.exports = {
    validateSchema
};
