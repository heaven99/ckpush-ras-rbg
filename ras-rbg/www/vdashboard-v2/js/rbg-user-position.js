$(document).ready(function () {
    console.log('--- Start rbg-user-position process ---');


    $.ajax({
        url : '/rbg/api/user/list',
        method : 'GET',
        dataType : 'json'
    }).done(function (json) {

        console.log('result=', json);

        var data = json.data;

        var html = '';
        for (var i = 0; i < data.length; i++) {
            //var d = new Date(riskData.features[i].properties.time);

            var time1 = data[i].time1.substring(0, 4)
                + "/" + data[i].time1.substring(4, 6)
                + "/" + data[i].time1.substring(6, 8)
                + " " + data[i].time1.substring(8, 10)
                + ":" + data[i].time1.substring(10, 12)
                + ":" + data[i].time1.substring(12, 14)


            html += "<tr>\n" +
                "    <td>" + data[i].seq + "</td>\n" +
                "    <td>" + data[i].user_id + "</td>\n" +
                "    <td>" + time1 + "</td>\n" +
                "    <td>" + data[i].gps_x + "</td>\n" +
                "    <td>" + data[i].gps_y + "</td>\n" +
                "    </tr>\n";
        }

        $('#user-data').html(html);

    }).fail(function (xhr, stauts, error) {
        console.log('--- error ajx');

    });

});