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

// Add a geojson point source.
// Heatmap layers also work with a vector tile source.
//         map.addSource('earthquakes', {
//             "type": "geojson",
//             "data": "https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson"
//         });

        // TODO
        // map.addSource('risk-data', {
        //     "type": "geojson",
        //     "data": window.sharedData.riskData            // set variable (Network 로 변경할 것)
        // });


        map.addSource('user-position', {
            "type": "geojson",
            "data": window.sharedData.userPositionData            // set variable
        });

        map.addSource('sns-risk-data', {
            "type": "geojson",
            "data": window.sharedData.snsRiskData            // set variable
        });

    });

    console.log('--- End mapbox process ---');

    window.map = map;
});