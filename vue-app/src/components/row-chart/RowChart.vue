<template>
  <div>
    <svg id="svg"></svg>
  </div>

</template>

<script>
/* eslint-disable */
import * as d3 from 'd3'

export default {
  mounted: function() {
    var el = d3.select(this.$el).select("#svg");

    this.y = d3.scaleBand().rangeRound([0, this.height], 10)
    this.x = d3.scaleLinear().range([this.width, 0])

    this.xAxis = d3.axisBottom(this.x);
    this.yAxis = d3.axisLeft(this.y).ticks(6);

    this.svg = el
      .attr("width", this.width)
      .attr("viewBox", " 0 0 " + this.width + " " + this.height)
      .attr("preserveAspectRatio", "xMidYMid")
      .append("g");

    this.drawChart(this.chartData);

  },
  watch: {
    chartData(newTree) {
      this.clearChart()
      this.drawChart(this.chartData)
    }
  },
  computed: {
    yScale: function () {
      if (this.field === 'education') {
        return ['High School', 'College', 'Graduate School']
      }
    },
    realData: function () {
      var rd = []
      var me = this
      me.chartData[me.yVar].forEach(d => {
        if (d[me.yVar]) {
          if (d[me.yVar] !== 'No') {
            if (this.field !== 'education' || d['customers'] > 1) {
              rd.push(d)
            }
          }
        }
      })
      return rd
    }
  },
  props: ['width', 'height', 'xVar', 'yVar', 'chartData', 'selectedBar', 'field'],
  methods: {
    drawChart: function(data) {
      var cdata = this.realData
      var me = this;

      if (this.field === 'education') {
        me.x.domain([0, d3.max(cdata, function(d) {
          return d[me.xVar];
        })]);
      }

      me.y.domain(me.yScale)

      var bar = me.svg.selectAll("g")
        .data(me.realData)
        .enter()
        .append("g")

      bar.append("rect")
        .attr("transform", "translate("+5+", 25)")
        .attr("height", function (d) {
          return 20
        })
        .attr("class", function(d) {
          if (d.key === me.selectedBar) {
            return "active"
          }
          else {
            return "bar"
          }
        })
        .attr("y", function(d) {
          return me.y(d[me.yVar]);
        })
        .attr("width", function(d) {
          return me.width - me.x(d[me.xVar]);
        })
        .on("click", function(d) {
          if (d3.select(this).attr("class") =='bar') {
            d3.select(this).attr("class", "active")
          }
          else {
            d3.select(this).attr("class", "bar")
          }
          me.barClicked(d)
        });

      bar.append("text")
        .attr("class", "value")
        .attr("y", function (d) {
          return me.y(d[me.yVar]) + 15
        })
        .attr("dx", 5)
        .attr("dy", ".35em")
        .attr("text-anchor", "center")
        .style("fill", "#34495e")
        .text(function(d){
          return d[me.yVar] + ": " + d[me.xVar];
        })
        .on("click", function(d) {
          me.barClicked(d)
        });

    },
    barClicked: function(bar) {
      let data = {
        field: this.field,
        bar: bar
      }
      this.$emit('barClicked', data)
    },
    clearChart: function() {
      this.svg.selectAll('g').remove()
      this.svg.selectAll('rect').remove()
    }
  }
}
</script>
<style>
  .bar {
    fill: black;
  }
  .bar:hover {
    cursor: pointer;
  }

  .active {
    fill: orange;
    cursor: pointer;
  }

  .axis-text {
    font-size: 12pt;
  }

  /*text {*/
    /*font: 10px sans-serif;*/
    /*color: blue!important;*/
    /*cursor: pointer;*/
  /*}*/
  .value {
    /*font-family: "Graphik", sans-serif;*/
    font-size: 1.0rem;
    font-weight: 300;
    line-height: 1.5;
    fill: #34495e;
    /*color: black;*/
    cursor: pointer;
  }
  .tar {
    cursor: pointer;
  }

</style>
