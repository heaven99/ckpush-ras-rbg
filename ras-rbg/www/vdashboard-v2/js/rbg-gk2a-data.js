$(document).ready(function () {
    console.log('--- Start rbg-riskdata process ---');

    $.ajax({
        url : '/rbg/api/gk2a/list',
        method : 'GET',
        dataType : 'json'
    }).done(function (json) {

        console.log('result=', json);

        var data = json.data;

        var html = '';
        for (var i = 0; i < data.length; i++) {
            //var d = new Date(riskData.features[i].properties.time);

            html += "<tr>\n" +
                "    <td>" + data[i].seq + "</td>\n" +
                // "    <td>" + d.getMonth() +"/" + (d.getDay() + 1) + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + "</td>\n" +
                "    <td>" + data[i].nc_time + "</td>\n" +
                "    <td>" + data[i].file + "</td>\n" +
                "    <td>" + data[i].algo + "</td>\n" +
                "    <td>" + data[i].check_time1 + "</td>\n" +
                "    <td>" + data[i].check_time2 + "</td>\n" +
                "    </tr>\n";
        }

        $('#gk2a-data').html(html);
        
    }).fail(function (xhr, stauts, error) {
        console.log('--- error ajx');

    });

//////////////////////////////////////////////////////////////////////////////////////////////////

});