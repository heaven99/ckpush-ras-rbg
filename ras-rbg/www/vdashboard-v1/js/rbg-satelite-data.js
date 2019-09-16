$(document).ready(function () {
    console.log('--- Start rbg-riskdata process ---');

    var riskData = window.sharedData.riskData;

    var html = '';
    for (var i = 0; i < riskData.features.length; i++) {
        var d = new Date(riskData.features[i].properties.time);

        html += "<tr>\n" +
            "    <td>" + (i + 1) + "</td>\n" +
            // "    <td>" + d.getMonth() +"/" + (d.getDay() + 1) + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + "</td>\n" +
            "    <td>" + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + "</td>\n" +
            "    <td>" + riskData.features[i].properties.rtype + "</td>\n" +
            "    <td>" + riskData.features[i].properties.mag + "</td>\n" +
            "    <td>" + riskData.features[i].geometry.coordinates[0] + "</td>\n" +
            "    <td>" + riskData.features[i].geometry.coordinates[1] + "</td>\n" +
            "    </tr>\n";
    }

    $('#risk-data').html(html);
//////////////////////////////////////////////////////////////////////////////////////////////////

});