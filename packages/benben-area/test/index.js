var assert = require('assert');
var area = require('../index');

describe('#realTable', function() {
    it('山东省/济南 --> 山东/济南', function() {
        let str = area.convert('山东省/济南');
        assert.equal('山东/济南', str);
    });
    it('内蒙古自治区/包头市 --> 内蒙古/包头', function() {
        let str = area.convert('内蒙古自治区/包头市');
        assert.equal('内蒙古/包头', str);
    });
    it('内蒙古自治区/包头市/昆区 --> 内蒙古/包头/昆都伦区', function() {
        let str = area.convert('内蒙古自治区/包头市/昆区');
        assert.equal('内蒙古/包头/昆都伦区', str);
    });
    it('北京市 --> 北京', function() {
        let str = area.convert('北京市');
        assert.equal('北京/北京', str);
    });
    it('北京市/大兴区 --> 北京/北京/大兴区', function() {
        let str = area.convert('北京市/大兴区');
        assert.equal('北京/北京/大兴区', str);
    });
    it('北京市/北京市/大兴区 --> 北京/北京/大兴区', function() {
        let str = area.convert('北京市/北京市/大兴区');
        assert.equal('北京/北京/大兴区', str);
    });
});