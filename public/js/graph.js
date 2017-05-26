(function($){
  $().ready(function(){

    var d3 = Plotly.d3;
    var gd3 = d3.select('#myDiv')
        .append('div')
        .style({
            width: '100%',
            height: '100%'
        });
    var gd = gd3.node();

    function updateGraph(){
      $.get(
        $('#coinSelector select').val(),
        {},
        function(data) {

          var dates = data.map(function(slice){ 
            return $.format.date( new Date(slice.created_at), "yyyy-MM-dd HH:mm:ss"); 
          });

          var prices = data.map(function(slice){ return parseFloat(slice.price); });   

          var rates = data.map(function(slice){ return parseFloat(slice.rate); });  

          var aveRates = [];
          var aveLength = 20;
          var total = 0;
          for(var day=aveLength; day<rates.length; day++){
            for( var aveDay=day - aveLength; aveDay < day; aveDay++){
              total += rates[aveDay];
            }
            aveRates[day] = total / aveLength;
            total = 0;
          }

          var aveRatesLine = {
            x: dates.slice( aveLength , dates.length ),
            y: aveRates,
            type: 'scatter',
            marker: {
              color: 'rgba(125,255,125,1.0)'
            },
          };

          var ratesLine = {
            x: dates,
            y: rates,
            type: 'scatter',
            marker: {
              color: 'rgba(125,125,255,1.0)'
            },
          };

          var pricesLine = {
            x: dates,
            y: prices,
            name: 'yaxis2 data',
            yaxis: 'y2',
            type: 'scatter',
            marker: {
              color: 'rgba(255, 125, 125, 1.0 )'
            }
          };

          var data = [ratesLine, pricesLine, aveRatesLine];

          var layout = {
            title: $('#coinSelector select').val() + ' Prices and Rates',
            paper_bgcolor: 'rgba(245,246,249,1)',
            plot_bgcolor: 'rgba(245,246,249,1)',
            showlegend: false,
            annotations: [],
            xaxis : { type:'date' },
            yaxis1: {
              tickfont: {color: 'rgb(125, 125, 255)'},
            },
            yaxis2: {
              tickfont: {color: 'rgb(255, 125, 125)'},
              overlaying: 'y',
              side: 'right'
            }
          };

          Plotly.newPlot(gd, data, layout);

          window.onresize = function() {
            Plotly.Plots.resize(gd);
          };
        }
      );
    }

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
    $('#coinSelector select').change( updateGraph );

  });
}(jQuery))