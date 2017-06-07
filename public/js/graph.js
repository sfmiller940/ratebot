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

    initGraph();
    function initGraph(){
      $.get(
        '/rates',
        {},
        function(rates){
          rates.forEach(function(rate){
            $('#coinSelector select').append('<option value="'+rate._id+'">'+rate._id+'</option>');
          });
          updateRates(rates);
          updateGraph();
        }
      );
    }

    function updateRates(rates){
      var rateDiv = '<table><tr class="row header"><th class="col coin">Coin</th><th class="col apy">APY</th><th class="col rate">24HPY</th></tr>';
      rates.forEach(function(rate){
        rateDiv += '<tr class="row">' 
          + '<td class="col coin">' + rate._id + '</td>' 
          + '<td class="col apy">' + ((Math.pow( 1 + rate.rate, 365 ) - 1) * 100).toFixed(2) +'%</td>'
          + '<td class="col rate">' + (100 * rate.rate).toFixed(4) + '%</td>' 
          + '</tr>';
      });
      $('#currentRates').html(rateDiv);
    }

    function updateGraph(){
      var coin = $('#coinSelector select').val();

      $.get(
        '/' + coin,
        {},
        function(rates) {

          traces[0]={
            x: rates.map(function(slice){ return $.format.date( new Date(slice.created_at), "yyyy-MM-dd HH:mm:ss"); }),
            y: rates.map(function(slice){ return parseFloat(slice.rate); }),
            type: 'scatter',
            marker: {
              color: 'rgba(125,125,255,1.0)'
            },
          };

          $.get(
            'https://poloniex.com/public?command=returnChartData'
              + '&currencyPair=' + (coin == 'BTC' ? 'USDT_BTC' : 'BTC_' + coin )
              + '&start=' + parseInt( Date.parse( traces[0].x[0] ) / 1000 )
              + '&end='+ parseInt( Date.parse( traces[0].x[ traces[0].x.length -1 ] ) / 1000 )
              + '&period=900',
            {},
            function(prices) {

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

              Plotly.newPlot(gd,[traces[0],traces[1]], {
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
              });
            }
          );
        }
      );
    }
    $('#coinSelector select').change(updateGraph);

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

    var aveLengthInput = $('#aveLength');
    var aveLengthWrap = $('#movingAve');
    $('#addAveLength').click(function(){
      traces.push( aveRate( aveLengthInput.val() , 'rgb(125,255,255)' ) );
      var aveIndex = traces.length - 1;
      Plotly.addTraces(gd, traces[ aveIndex ]);
      aveLengthWrap.prepend('<label><input type="checkbox" name="ave'+aveIndex+'" id="ave'+aveIndex+'" value="'+ aveIndex +'" checked>'+aveLengthInput.val() +'</label>');
      aveLengthInput.val('');

      aveLengthWrap.find('#ave'+aveIndex).change(function(){
        var removeInd = parseInt( $(this).val() );
        Plotly.deleteTraces( gd, removeInd );
        aveLengthWrap.find('input[type="checkbox"]').each(function(){
          if( $(this).val() > removeInd ) $(this).val( $(this).val() - 1 );
        });
        traces.splice(removeInd,1);
        $(this).parent().remove();
      });
    });
  });
}(jQuery))