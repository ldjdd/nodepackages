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
    var pinfo;
    var cinfo;
    var dinfo;
    var city;
    var district;

    if(arr[0]) // 处理省份
    {
        pinfo = findProvince(arr[0]);
        if(pinfo)
        {
            if(firstCities.indexOf(pinfo.name) !== -1) // 直辖市
            {
                cinfo = {index: 0, name: pinfo.name};
            }
            if(arr[1]) city = arr[1];
        }
        else if(!pinfo)  // 省份找不到降级到城市
        {
            city = arr[0];
        }
    }

    if(pinfo && cinfo) // 直辖市,直跳最后一步
    {
        if(arr.length == 1) // 北京
        {
            return {p: pinfo, c: cinfo};
        }

        district = arr[arr.length - 1];

        if(district == arr[0]) // 北京/北京
        {
            return {p: pinfo, c: cinfo};
        }

        dinfo = findDistrict(district, pinfo.index, cinfo.index);

        if(dinfo) // 北京/海淀区
        {
            return {p: pinfo, c: cinfo, d: dinfo};
        }
        else
        {
            return {p: pinfo, c: cinfo};
        }
    }

    if(city) // 处理城市
    {
        if(pinfo)
        {
            cinfo = findCity(city, pinfo.index);
            if(cinfo) // 山东/济南/历城区
            {
                if(arr[2])
                {
                    district = arr[2];
                }
                else
                {
                    return {p: pinfo, c: cinfo};
                }
            }
            else
            {
                return {p: pinfo};
            }
        }
        else // 济南/历城区
        {
            let ret = findCity(city);
            if(ret)
            {
                pinfo = ret.p;
                cinfo = ret.c;
                if(arr[1]) district = arr[1];
            }
            else
            {
                return false;
            }
        }
    }

    if(district)
    {
        dinfo = findDistrict(district, pinfo.index, cinfo.index);
        return {
            p: pinfo,
            c: cinfo,
            d: dinfo
        };
    }

    return false;
}

function findProvince(province){
    for(let i=0; i<areaData.length; i++){
        if(province == areaData[i]['name']
            || province == areaData[i]['name'] + '省'
            || province == areaData[i]['name'] + '自治区'
            || province == areaData[i]['name'] + '市'
            || (province.match(areaData[i]['name']) && province != '吉林市'))
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
                if(cityName == cities[j]['name']
                    || cityName == cities[j]['name'] + '市')
                {
                    return {
                        p: {index: i, name: areaData[i]['name']},
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