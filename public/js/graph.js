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

          var dates, loOffers, hiDemands, heights, prices;

          dates = data.map(function(slice){ 
            return $.format.date( new Date(slice.created_at), "yyyy-MM-dd HH:mm:ss"); 
          });

          prices = data.map(function(slice){ return parseFloat(slice.price); });   

          loOffers = data
            .map( function(slice){ return slice.offers; } )
            .map( function(offers){
              return offers.filter( function(offer){
                if( parseFloat( offer.amount ) < 0.01 ){ return false; }
                return true;
              });
            })
            .map(function(offers){ return Math.min.apply(null, offers.map( function(offer){ return parseFloat( offer.rate ); } ) );
            });

          hiDemands = data
            .map( function(slice){ return slice.demands; } )
            .map( function(demands,ind){
              return demands.filter( function(demand){
                if( parseFloat( demand.amount ) < 0.01 || parseFloat(demand.rate) > loOffers[ind] ){ return false; }
                return true;
              });
            })
            .map(function(demands){ return Math.max.apply(null, demands.map( function(demand){ return parseFloat(demand.rate); } ) );
            });

          var trace0 = {
            x: dates,
            y: hiDemands,
            marker: {
              color: 'rgba(125,255,125,1.0)'
            },
            type: 'bar'
          };

          var trace1 = {
            x: dates,
            y: loOffers,
            marker: {
              color: 'rgba(125,125,255,1.0)'
            },
            type: 'bar'
          };

          var trace3 = {
            x: dates,
            y: prices,
            name: 'yaxis2 data',
            yaxis: 'y2',
            type: 'scatter',
            marker: {
              color: 'rgba(255, 125, 125, 1.0 )'
            }
          };

          var data = [trace1, trace0, trace3];

          var layout = {
            title: 'BTC Rates',
            barmode: 'overlay',
            paper_bgcolor: 'rgba(245,246,249,1)',
            plot_bgcolor: 'rgba(245,246,249,1)',
            showlegend: false,
            annotations: [],
            xaxis : { type:'date' },
            yaxis2: {
              tickfont: {color: 'rgb(148, 103, 189)'},
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