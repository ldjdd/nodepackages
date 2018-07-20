module.exports = {
    /**
     * Build 'and' condition
     * @param params
     */
    operand: function (op, params) {
        switch (op) {
            case 'ADD':
                return operandAdd(params);
        }
    }
};

function operandAdd() {

}