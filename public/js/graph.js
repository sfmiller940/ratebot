(function($){
  $().ready(function(){

    var traces=Array();

    var d3 = Plotly.d3;
    var gd3 = d3.select('#myDiv')
        .append('div')
        .style({
            width: '100%',
            height: '100%'
        });
    var gd = gd3.node();

    window.onresize = function() {
      Plotly.Plots.resize(gd);
    };

    $.get(
      '/coins',
      {},
      function(coins){
        coins.sort().forEach(function(coin){
          $('#coinSelector select').append('<option value="'+coin+'">'+coin+'</option>');
        });
        updateGraph();
      }
    );
    $('#coinSelector select').change(updateGraph);

    var aveLengthInput = $('#aveLength');
    var aveLengthWrap = $('#movingAve');
    $('#addAveLength').click(function(){
      traces.push( aveRate( aveLengthInput.val() , 'rgb(125,255,255)' ) );
      var aveIndex = traces.length - 1;
      Plotly.addTraces(gd, traces[ aveIndex ]);
      aveLengthWrap.prepend('<label><input type="checkbox" value="'+ aveIndex +'" checked>'+aveLengthInput.val() +'</label>');
      aveLengthWrap.find('input[type="checkbox"]').change(function(){
        Plotly.deleteTraces(gd, parseInt($(this).val()) );
        $(this).parent().remove();
      });
      aveLengthInput.val('');
    });

    function updateGraph(){
      $.get(
        $('#coinSelector select').val(),
        {},
        function(data) {

          var dates = data.map(function(slice){ 
            return $.format.date( new Date(slice.created_at), "yyyy-MM-dd HH:mm:ss"); 
          });

          var rates = data.map(function(slice){ return parseFloat(slice.rate); });  

          traces[0]={
            x: dates,
            y: rates,
            type: 'scatter',
            marker: {
              color: 'rgba(125,125,255,1.0)'
            },
          };

          var layout = {
            title: $('#coinSelector select').val() + ' Prices and Rates',
            paper_bgcolor: 'rgba(245,246,249,1)',
            plot_bgcolor: 'rgba(245,246,249,1)',
            showlegend: false,
            annotations: [],
            xaxis : { type:'date' },
            yaxis1: {
              tickfont: {color: 'rgb(125, 125, 255)'},
              title: 'Rate',
              titlefont: {
                color: 'rgb(125,125,255)',
              }
            },
            yaxis2: {
              tickfont: {color: 'rgb(255, 125, 125)'},
              overlaying: 'y',
              side: 'right',
              title: 'Price',
              titlefont:{
                color: 'rgb(255,125,125)',
              },
            }
          };

          Plotly.newPlot(gd, Array(traces[0]), layout);

          var string='https://poloniex.com/public?command=returnChartData&currencyPair='
              + ($('#coinSelector select').val() == 'BTC' ? 'USDT_BTC' : 'BTC_' + $('#coinSelector select').val()  )
              + '&start=' + parseInt( Date.parse( traces[0].x[0] ) / 1000 )
              + '&end='+ parseInt( Date.parse( traces[0].x[ traces[0].x.length -1 ] ) / 1000 )
              + '&period=300';

          $.get(
            string,
            {},
            function(prices) {
              console.log( string);
              traces[1]={
                x: prices.map(function(slice){ return $.format.date( new Date(slice.date * 1000), "yyyy-MM-dd HH:mm:ss"); }),
                y: prices.map(function(slice){ return slice.weightedAverage }),
                name: 'yaxis2 data',
                yaxis: 'y2',
                type: 'scatter',
                marker: {
                  color: 'rgba(255, 125, 125, 1.0 )'
                }
              };
              Plotly.addTraces(gd,traces[1]);
            }
          );
        }
      );
    }

    function aveRate(aveLength, color){
      var dates = traces[0].x;
      var rates = traces[0].y;
      var aveRates = [];
      var total = 0;
      aveLength = parseInt(aveLength);

      for(var day=aveLength; day<rates.length; day++){
        for( var aveDay=day - aveLength; aveDay < day; aveDay++){
          total += rates[aveDay];
        }
        aveRates[day] = total / aveLength;
        total = 0;
      }

      return {
        x: dates.slice( aveLength , dates.length ),
        y: aveRates,
        type: 'scatter',
        marker: {
          color: color
        },
      };
    }
  });
}(jQuery))