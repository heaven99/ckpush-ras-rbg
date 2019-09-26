$(document).ready(function () {
    console.log('--- Start mapbox process ---');


    // Error : Failed to load resource: the server responded with a status of 401 (Unauthorized)
    mapboxgl.accessToken = 'pk.eyJ1IjoiY2hvaHMiLCJhIjoiY2p1MGxkbTNyMTI5YTQzbWhsNmxvaTRqNCJ9.8UPFu-2KAs8R2SibXWXYOQ';

    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/dark-v10',       // -v4 에서는 작동하지 않는다..
        // center: [-120, 50],
        center: [127.13, 37.4],                         // 확대/축소에 따라 차이가 많이 나니 zoom 값과 같이 확인할 것. (경도(Long), 위도(Lati) 순)
        zoom: 12,
    });


    map.on('load', function () {
        console.log('---mapbox loaded');
        //
        // var risk_element = {
        //     "type": "Feature",
        //     "properties": {
        //         "id": "ak16994521",
        //         "rtype" : "폭우",
        //         "mag": 4.0,
        //         "time": 1507425650893,
        //         "felt": null,
        //         "tsunami": 0
        //     },
        //     "geometry": {
        //         "type": "Point",
        //         "coordinates": [127.15, 37.4, 0.0]
        //     }
        // };

        var riskData = {
            "type": "FeatureCollection",
            "crs": {
                "type": "name",
                "properties": {
                    "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
                }
            },
            "features": []
        };

        $.ajax({
            url : '/rbg/api/algo/list',
            method : 'GET',
            dataType : 'json'
        }).done(function (json) {
            // console.log('result=', json);
            console.log('risk ajax success');

            var data = json.data;


            // TEST
            data[0][0] = 127.15;
            data[0][1] = 37.41;
            for (var i = 0; i < data.length - 1; i++) {
                riskData.features[i] = {
                    "type": "Feature",
                    "properties": {
                        "id": "ak" + i,
                        "rtype" : "폭우",
                        "mag": 4.0,
                        "time": 1507425650893,
                        "felt": null,
                        "tsunami": 0
                    },
                    "geometry": {
                        "type": "Point",
                        //"coordinates": [127.15, 37.41, 0.0]
                        "coordinates": [parseFloat(data[i][0]), parseFloat(data[i][1]), 0.0]
                    }
                };
            }

            window.sharedData.riskData = riskData;

            // TODO
            window.map.addSource('risk-data', {
                "type": "geojson",
                "data": window.sharedData.riskData            // set variable (Network 로 변경할 것)
            });
        }).fail(function (xhr, stauts, error) {
            console.log('--- error riskdata ajax');
        });



        ///////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////ß
        var userData = {
            "type": "FeatureCollection",
            "crs": {
                "type": "name",
                "properties": {
                    "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
                }
            },
            "features": []
        };

        $.ajax({
            url : '/rbg/api/user/list',
            method : 'GET',
            dataType : 'json'
        }).done(function (json) {
            console.log('user list ajax success');

            var data = json.data;

            // TEST
            data[0][0] = 127.15;
            data[0][1] = 37.41;
            for (var i = 0; i < data.length - 1; i++) {
                userData.features[i] = {
                    "type": "Feature",
                    "properties": {
                        "id": "ak" + i,
                        "rtype" : "",
                        "mag": 4.0,
                        "time": 1507425650893,
                        "felt": null,
                        "tsunami": 0
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [parseFloat(data[i].gps_x), parseFloat(data[i].gps_y), 0.0]
                    }
                };
            }

            window.sharedData.userPositionData = userData;
            //console.log(window.sharedData.userPositionData);

            map.addSource('user-position', {
                "type": "geojson",
                "data": window.sharedData.userPositionData            // set variable
            });
        }).fail(function (xhr, stauts, error) {
            console.log('--- error riskdata ajax');
        });




        map.addSource('sns-risk-data', {
            "type": "geojson",
            "data": window.sharedData.snsRiskData            // set variable
        });

    });

    console.log('--- End mapbox process ---');

    window.map = map;
});