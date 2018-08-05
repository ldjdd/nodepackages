module.exports = {
    /**
     * Build 'and' condition
     * @param params
     */
    buildOperand: function (params) {
        switch (params[1]) {
            case '=':
                return params[0] + ' = ?';
            case '>':
                return params[0] + ' > ?';
        }
    }
};

function operandEqual() {

}