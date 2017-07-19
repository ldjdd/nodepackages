/**
 * Created by ldj on 2017/7/15.
 */

const DEFAULT_LIMIT = 10;
var _limit = DEFAULT_LIMIT; // count that per page show
var _currentPage = 1;
var _pageCount = 0; // total page
var _total = 0; // total record

exports.setTotal = function (total) {
    _total = total;
}

exports.setPage = function (page) {
    _currentPage = page ? page : 0;
}

exports.setLimit = function (limit) {
    _limit = limit > 0 ? limit : DEFAULT_LIMIT;
}

exports.getOffset = function () {
    return _limit * (getCurrentPage() - 1);
}

exports.getLimit = function () {
    return _limit < 1 ? DEFAULT_LIMIT : _limit;
}

function getCurrentPage() {
    return _currentPage < 1 ? 1 : _currentPage;
}