/**
 * Created by likaci on 08/10/2016
 */

const Rx = require("rx");
const request = require("request");
const leftPad = require('left-pad');

Rx.Observable
    .range(1, 12)
    .map(function (month) {
        month = leftPad(month, 2, '0');
        var year = 2016;
        return `https://sp0.baidu.com/8aQDcjqpAAV3otqbppnN2DJv/api.php?query=${year}${month}&resource_id=6018&ie=utf8&oe=utf8`;
    })
    .flatMap(function (url) {
        return rxRequest(url);
    })
    .flatMap(function (res) {
        //parse response to holiday
        var holiday = JSON.parse(res).data[0].holiday;
        if (holiday instanceof Array) {
            return Rx.Observable.from(holiday);
        } else if (holiday != null) {
            return Rx.Observable.just(holiday);
        } else {
            return Rx.Observable.just(null);
        }
    })
    .filter(function (holiday) {
        return holiday != null;
    })
    .distinct(function (holiday) {
        return holiday.name;
    })
    .toArray()
    .map(function (holidayArray) {
        return holidayArray.sort(function (a, b) {
            /** @namespace a.festival */
            return new Date(a.festival).getTime() - new Date(b.festival).getTime();
        });
    })
    .subscribe(function (v) {
        console.log(v);
    });

function rxRequest(url, qs) {
    return Rx.Observable.create(function (observer) {
        request({
            url: url,
            qs: qs
        }, function (err, res, body) {
            if (!err) {
                observer.onNext(body);
                observer.onCompleted();
            } else {
                observer.onError(err);
            }
        })
    })
}

