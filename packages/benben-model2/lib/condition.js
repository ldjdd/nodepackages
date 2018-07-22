module.exports = {
    /**
     * Build 'and' condition
     * @param params
     */
    operand: function (op, params) {
        switch (op) {
            case 'AND':
                return operandAdd(params);
        }
    }
};

function operandAdd() {

}