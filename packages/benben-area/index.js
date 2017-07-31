/**
 * Created by ldj on 2017/7/31.
 */

var areaData = require('./data');
var firstCities = ['北京', '上海', '重庆', '天津'];

exports.convert = function(area){
    var res = _convert(area);
    var str = '';
    if(res.p){
        str += res.p.name;
    }
    if(res.c){
        str += '/' + res.c.name;
    }
    if(res.d){
        str += '/' + res.d.name;
    }
    return str;
}

/**
 * '内蒙古自治区/包头市' --> '内蒙古/包头市'
 * '北京市'
 * @param area
 */
function _convert (area) {
    var arr = area.split('/');
    var pinfo = findProvince(arr[0]);

    if(arr.length == 1)
    {
        if(pinfo === false) // 通过市获取数据
        {
            return findCity(arr[0]);
        }
        else
        {
            if(firstCities.indexOf(pinfo.name) !== -1)
            {
                return {p: pinfo, c: {index: 0, name: pinfo.name}};
            }
            return {p: pinfo};
        }
    }

    if(arr.length == 2) // 通过省市获取数据
    {
        if(pinfo === false)
        {
            return findCity(arr[1]);
        }
        else
        {
            if(firstCities.indexOf(pinfo.name) !== -1)
            {
                let dinfo = findDistrict(arr[1], pinfo.index, 0);
                return {
                    p: pinfo,
                    c: {index: 0, name: pinfo.name},
                    d: dinfo
                };
            }
            else
            {
                let cinfo = findCity(arr[1], pinfo.index);
                return {
                    p: pinfo,
                    c: cinfo
                };
            }
        }
    }

    if(arr.length == 3) // 通过省市区获取数据
    {
        let cinfo;
        if(pinfo !== false)
        {
            cinfo = findCity(arr[1], pinfo.index);
        }
        else
        {
            cinfo = findCity(arr[1]);
            cinfo = cinfo.c;
            pinfo = cinfo.d;
        }

        if(cinfo !== false)
        {
            let dinfo = findDistrict(arr[2], pinfo.index, cinfo.index);
            if(dinfo !== false)
            {
                return {
                    'p': pinfo,
                    'c': cinfo,
                    'd': dinfo
                };
            }
            else
            {
                return {
                    'p': pinfo,
                    'c': cinfo
                };
            }
        }
    }

    return false;
}

function findProvince(province){
    for(let i=0; i<areaData.length; i++){
        if(province == areaData[i]['name']
            || province == areaData[i]['name'] + '省'
            || province == areaData[i]['name'] + '自治区'
            || province == areaData[i]['name'] + '市')
        {
            return {index: i, name: areaData[i]['name']};
        }
    }
    return false;
}

function findCity(cityName, provinceIndex){
    if(typeof provinceIndex != 'undefined')
    {
        var cities = areaData[provinceIndex]['city'];
        for(let i=0; i<cities.length; i++){
            if(cityName == cities[i]['name']
                || cityName == cities[i]['name'] + '市')
            {
                return {index: i, name: cities[i]['name']};
            }
        }
    }
    else
    {
        for(let i=0; i<areaData.length; i++){
            let cities = areaData[i]['city'];
            for(let j=0; j<cities.length; j++){
                if(cityName == cities[i]['name']
                    || cityName == areaData[i]['name'] + '市')
                {
                    return {
                        p: {index: i, name: cities[i]['name']},
                        c: {index: j, name: cities[j]['name']}
                    };
                }
            }
        }
    }

    return false;
}

function findDistrict(name, provinceIndex, cityIndex){

    var districts = areaData[provinceIndex]['city'][cityIndex]['area'];
    var dname;
    for(let i=0; i<districts.length; i++){
        dname = districts[i];
        if(name == dname
            || dname.match(name[0] + '(.*)' + name[1]))
        {
            return {index: i, name: districts[i]};
        }
    }

    return false;
}