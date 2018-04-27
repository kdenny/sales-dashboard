
<template>
  <div>
    <!--<div id="legend"></div>-->
    <svg id="svg"></svg>
  </div>

</template>

<script>
/* eslint-disable */
import * as d3 from 'd3'

export default {
  mounted: function() {
    var el = d3.select(this.$el).select("#svg");

    this.x = d3.scaleBand().rangeRound([0, this.width], 5)
    this.y = d3.scaleLinear().range([this.height, 0])

    this.xAxis = d3.axisBottom(this.x);
    this.yAxis = d3.axisLeft(this.y).ticks(6);

    this.tooltip = d3.select(this.$el).append("div").attr("class", "toolTip-bar")

    this.svg = el
      .attr("width", this.width + 20)
      .attr("height", this.height + 30)
        .attr("viewBox", " 0 0 " + (this.width+20) + " " + (this.height+40))
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
    realSelected: function () {
      // Correct for the way Universe handles 0 as a null-ish
      if (this.selectedBar === '0') {
        return 0
      } else {
        return this.selectedBar
      }
    },
    xScale: function () {
      var me = this
      if (this.chartData[me.xVar]) {
        let xs = []
        this.chartData[me.xVar].forEach(function (d) {
          xs.push(d[me.xVar])
        })
        return xs
      } else {
        return null
      }
    },
    realData: function () {
      return this.chartData[me.xVar].map(d => {
          d.key = d.key.toString()
          return d
        })
    }
  },
  props: ['width', 'height', 'xVar', 'yVar', 'chartData', 'selectedBar', 'field', 'increment', 'endBin', 'scale'],
  methods: {
    drawChart: function(data) {
      var me = this;
      me.y.domain([0, d3.max(me.chartData[me.xVar], function(d) {
        return d[me.yVar];
      })]);
      me.x.domain(me.xScale)

      me.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + me.height + ")")
        .call(me.xAxis)
        .selectAll("text")
        .attr("class", function(d) {
          if (d.key === me.realSelected) {
            return "active"
          }
          else {
            return "bar"
          }
        })
        .text(function (d, i) {
          if (d % (3 * me.increment) === 0) {
            if (d !== 0) {
              return d.toString() + me.scale
            } else {
              return '0'
            }
          } else{
            return ''
          }
        })
        .style("text-anchor", "end")
        .attr("class","axis-text")
        .attr("dx", "-1.0em")
        .attr("dy", "-.9em")
        .attr("font-size", "20")
        .attr("transform", "translate(20,0)")
        .attr("transform", "rotate(-90)" );

      me.svg.append("g")
        .attr("class", "y axis")
        .call(me.yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("class","axis-text")
        .attr("y", -50)
        .attr("x", -me.height/2)
        .attr("dy", ".71em")
        .style("text-anchor", "middle")
        .text("Customers");

      me.svg.selectAll("bar")
        .data(me.chartData[me.xVar])
        .enter().append("rect")
        .attr("class", function(d) {
          if (d.key === me.realSelected) {
            return "active"
          }
          else {
            return "bar"
          }
        })
        .on("mousemove", function(d){
          if (d.key !== me.endBin) {
            d.value_bin = '$' + d.key.toString() + '-' + (d.key + me.increment).toString() + me.scale
          } else {
            d.value_bin = '$' + me.endBin.toString() + me.scale + '+'
          }
          me.tooltip
            .style("left", (me.x(d[me.xVar]) + 3) + "px")
            .style("top", "0px")
            .style("display", "inline-block")
            .html((d.value_bin) + "<br>" + (d.customers) + " customers")
        })
        .on("mouseout", function(d){ me.tooltip.style("display", "none")})
        .on("click", function(d) {
          console.log(d3.select(this))
          if (d3.select(this).attr("class") =='bar') {
            d3.select(this).attr("class", "active")
          }
          else {
            d3.select(this).attr("class", "bar")
          }
          me.barClicked(d)
        })
        .attr("x", function(d) {
          return me.x(d[me.xVar]);
        })
        .attr("width", (me.x.bandwidth()-5))
        .attr("y", function(d) {
          return me.y(d[me.yVar]);
        })
        .attr("height", function(d) {
          if (me.height - me.y(d[me.yVar]) > 0) {
            return me.height - me.y(d[me.yVar]);
          } else {
            return 0;
          }
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
  }
  .axis-text {
    font-size: "20";

  }
</style>
