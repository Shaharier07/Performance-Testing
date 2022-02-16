/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7242424242424242, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.8, 500, 1500, "Update (Put)"], "isController": false}, {"data": [0.8166666666666667, 500, 1500, "Register successful (Post)"], "isController": false}, {"data": [0.0, 500, 1500, "List User (Get)"], "isController": false}, {"data": [1.0, 500, 1500, "Single User (Get)"], "isController": false}, {"data": [0.0, 500, 1500, "Delayed Response (Get)"], "isController": false}, {"data": [1.0, 500, 1500, "Single resource (Get)"], "isController": false}, {"data": [0.7666666666666667, 500, 1500, "Create (Post)"], "isController": false}, {"data": [0.9, 500, 1500, "DELETE (Delete)"], "isController": false}, {"data": [0.8333333333333334, 500, 1500, "Update (Patch)"], "isController": false}, {"data": [0.85, 500, 1500, "login Successful (Post)"], "isController": false}, {"data": [1.0, 500, 1500, "List <Resource> (Get)"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 330, 0, 0.0, 1503.5484848484853, 98, 15126, 481.5, 3619.3, 9204.449999999997, 13901.85, 14.293758392168753, 16.056240728007104, 2.746066509290943], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Update (Put)", 30, 0, 0.0, 495.3999999999999, 446, 622, 484.5, 546.7, 593.4, 622.0, 2.8904518739762985, 2.507504636766548, 0.6605134165141151], "isController": false}, {"data": ["Register successful (Post)", 30, 0, 0.0, 489.9333333333333, 453, 548, 492.0, 517.8, 536.4499999999999, 548.0, 2.936282666144661, 2.419374571792111, 0.7025285675834393], "isController": false}, {"data": ["List User (Get)", 30, 0, 0.0, 9611.699999999997, 4941, 15126, 9537.5, 13915.5, 14729.449999999999, 15126.0, 1.9269060312158777, 3.57694477005588, 0.30484255571969937], "isController": false}, {"data": ["Single User (Get)", 30, 0, 0.0, 137.46666666666667, 101, 221, 130.0, 176.20000000000002, 207.79999999999998, 221.0, 3.096614368290669, 3.4743166481729975, 0.47477388263831544], "isController": false}, {"data": ["Delayed Response (Get)", 30, 0, 0.0, 3515.2, 3452, 3660, 3490.5, 3619.3, 3644.05, 3660.0, 2.2148394241417497, 3.907547757475083, 0.3525574473975637], "isController": false}, {"data": ["Single resource (Get)", 30, 0, 0.0, 136.53333333333336, 98, 193, 130.5, 167.8, 191.9, 193.0, 3.0918272699165206, 3.322204633876121, 0.48007864835617853], "isController": false}, {"data": ["Create (Post)", 30, 0, 0.0, 527.4000000000001, 453, 1467, 499.0, 529.2, 952.7499999999993, 1467.0, 2.887947631882942, 2.531936639632268, 0.6373790671929149], "isController": false}, {"data": ["DELETE (Delete)", 30, 0, 0.0, 485.3333333333333, 443, 549, 478.5, 530.9, 545.15, 549.0, 2.932264685758968, 2.1951895586941648, 0.5125736120613821], "isController": false}, {"data": ["Update (Patch)", 30, 0, 0.0, 497.6, 457, 584, 489.0, 552.8000000000001, 582.9, 584.0, 2.9279718914698423, 2.541388102674214, 0.6748060218621901], "isController": false}, {"data": ["login Successful (Post)", 30, 0, 0.0, 501.33333333333337, 453, 669, 484.5, 588.4, 626.0999999999999, 669.0, 2.889338341519792, 2.362636039680247, 0.6941183906385439], "isController": false}, {"data": ["List <Resource> (Get)", 30, 0, 0.0, 141.13333333333335, 101, 197, 138.5, 188.50000000000003, 196.45, 197.0, 3.0921459492888066, 4.751959969593898, 0.47408878324056897], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 330, 0, null, null, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
