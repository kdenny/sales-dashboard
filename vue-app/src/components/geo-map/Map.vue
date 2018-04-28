<template>
  <div>
  </div>

</template>

<script>
/* eslint-disable */
import * as d3 from 'd3'
import usData from './usData'

export default {
  computed: {
    fullData () {
      if (this.chartData) {
        let featureArray = []
        for (var d = 0; d < usData.usMap.features.length; d++) {
          let feat = usData.usMap.features[d]
          this.populations[feat.properties.abbr] = feat.properties.population
          this.chartData.state.forEach(s => {
            if (s.state === feat.properties.abbr) {
              feat.properties.customers = s.customers
              feat.properties.density = s.customers / feat.properties.population
              feat.properties.value = s.customers
            }
          })
          if (!feat.properties.value) {
            feat.properties.value = 0
          }
          featureArray.push(feat)
        }
        return featureArray
      } else {
        return null
      }
    }
  },
  data () {
    return {
      colors: {
        high: '#bc2a66',
        low: '#f9f9f9'
      },
      populations: {},
      hovered: null
    }
  },
  mounted: function() {
    this.svg = d3.select(this.$el).append("svg")
      .attr("width", this.width)
      .attr("height", this.height);;

    var me = this
    var projection = d3.geoAlbers()
      .translate([(1*me.width) / 2, 2*me.height / 5])
      .scale([810]);

    this.path = d3.geoPath()
      .projection(projection);

    this.tooltip = d3.select(me.$el).append("div").attr("class", "toolTip-map")
    this.drawChart(me.fullData)

  },
  watch: {
    chartData(newTree) {
      this.clearChart()
      this.drawChart(this.chartData)
    }
  },
  props: ['width', 'height', 'xVar', 'chartData', 'selectedBar', 'field'],
  methods: {
    drawChart: function(data) {
      var me = this;
      var minVal = 0
      var maxVal = d3.max(me.fullData, function(d) {
        return d.properties.value;
      })

      var ramp = d3.scaleLinear().domain([minVal,maxVal]).range([me.colors.low,me.colors.high])

      this.map = me.svg.selectAll("path")
        .data(me.fullData)
        .enter().append("path")
        .attr("d", me.path)
        .attr("class", function(d) {
          if (d.properties.abbr === me.selectedBar) {
            return "active-map"
          }
          else {
            return "state-path"
          }
        })
        .style("stroke", "lightgray")
        .style("stroke-width", "1")
        .on("mousemove", function(d){
          me.tooltip
            .style("left", d3.event.pageX - 100 + "px")
            .style("top", d3.event.pageY - 150 + "px")
            .style("display", "inline-block")
            .html((d.properties.name) + "<br>" + (d.properties.value) + " customers")
        })
        .on("mouseout", function(d){
          me.tooltip.style("display", "none")
        })
        .on("click", function(d) {
          if (d3.select(this).attr("class") =='state-path') {
            d3.select(this).attr("class", "active-map")
          }
          else {
            d3.select(this).attr("class", "state-path")
          }
          me.barClicked(d)
        })
        .style("fill", function(d) {
          if (me.selectedBar) {
            if (d.properties.abbr === me.selectedBar) {
              return ramp(d.properties.value)
            } else {
              return '#a9a9a9'
            }
          } else {
            return ramp(d.properties.value)
          }
        })
        .style("opacity", function(d) {
          if (me.selectedBar) {
            if (d.properties.abbr === me.selectedBar) {
              return 1
            } else {
              return 0.1
            }
          } else {
            return 1
          }
        })

        // add a legend
        var w = 120, h = 200;

        this.key = d3.select(me.$el).append("svg").attr("id", "legend")
          .attr("width", w)
          .attr("height", h)
          .attr("class", "legend");


        this.key.append("text")
          .attr("class", "legend-title")
          .text("Legend")
          .attr("dx", "0.6em")
          .attr("dy", "0.6em")

        this.legend = me.key.append("defs")
          .append("svg:linearGradient")
          .attr("id", "gradient")
          .attr("x1", "100%")
          .attr("y1", "0%")
          .attr("x2", "100%")
          .attr("y2", "100%")
          .attr("spreadMethod", "pad");

        this.legend.append("stop")
          .attr("offset", "0%")
          .attr("stop-color", me.colors.high)
          .attr("stop-opacity", 1);

        this.legend.append("stop")
          .attr("offset", "100%")
          .attr("stop-color", me.colors.low)
          .attr("stop-opacity", 1);

        this.key.append("rect")
          .attr("width", w - 100)
          .attr("height", h)
          .style("fill", "url(#gradient)")
          .attr("transform", "translate(0,10)");

        var y = d3.scaleLinear()
          .range([h, 0])
          .domain([minVal, maxVal]);

        var yAxis = d3.axisRight(y);

        this.key.append("g")
          .attr("class", "y axis")
          .attr("transform", "translate(41,10)")
          .call(yAxis)
        this.calcPopulations()
    },
    calcPopulations: function () {
      var me = this
      this.$emit('populations', me.populations)
    },
    barClicked: function(bar) {
      let data = {
        field: this.field,
        bar: {
          key: bar.properties.abbr
        }
      }
      this.$emit('barClicked', data)
    },
    clearChart: function() {
      this.map.remove()
      this.legend.remove()
      this.key.remove()
    },
    showTooltip: function(d) {
      console.log(d)
    },
    doHover: function(d) {
      me.hovered = d.properties.abbr
      this.$emit('dohover', me.hovered)
    },
    unhover: function(d) {
      this.$emit('unhover', me.hovered)
    }
  }
}
</script>
<style>
  .legend {
    position: absolute;
    left: 87%;
    top: 300px;
  }
  .bar {
    fill: black;
  }
  .bar:hover {
    cursor: pointer;
  }
  .state-path:hover {
    cursor: pointer;
  }

  .state-path {
    stroke: #000;
  }

  .active-map {
    stroke: black!important;
    stroke-width: 3px;
  }
  .axis-text {
    font-size: 12pt;
  }
</style>
