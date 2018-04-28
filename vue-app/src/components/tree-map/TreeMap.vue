<template>
  <!-- eslint-disable-next-line vue/max-attributes-per-line -->
  <div v-if="treeData">
    <div class="cheader">Segments</div>
    <svg></svg>
  </div>
</template>

<script>
/* eslint-disable */
import * as d3 from 'd3'
import { tretl } from './treeETL'

export default {
  name: 'tree-map',
  data () {
    return {
      parsedTree: {},
      selected: null,
      sum: null
    }
  },
  props: ['treeData', 'height', 'width', 'selectedBar'],
  watch: {
    treeData(newTree) {
      if (!this.selectedBar) {
        this.clearChart()
        tretl(this.treeData)
        this.renderChart()
        this.renderChart()
      } else {
        this.handleSelection()
      }
    }
  },
  mounted () {
    this.tooltip = d3.select(this.$el).append("div").attr("class", "toolTip-tree")
    this.parsedTree = tretl(this.treeData)
    if (this.parsedTree) {
      this.renderChart()
    }
  },
  methods: {
    clearChart() {
      this.svg.selectAll("g").remove()
    },
    renderChart () {
      var me = this
      this.svg = d3.select(this.$el).select('svg').attr("width", this.width).attr("height", this.height)
      let width = this.width
      let height = this.height

      const format = d3.format(",d")

      this.treemap = d3.treemap()
        .tile(d3.treemapResquarify)
        .size([width, height])
        .round(true)
        .paddingInner(3)

      this.root = d3.hierarchy(this.parsedTree)
        .eachBefore(function(d) {
          d.data.id = d.data.name;
        })
        .sum(this.sumBySize)
        .sort(function(a, b) {
          return b.height - a.height || b.value - a.value;
        })

      this.treemap(this.root)

      this.cell = this.svg.selectAll("g")
        .data(this.root.leaves())
        .enter().append("g")
        .on("click", function (d) {
          console.log(d)
          if (d3.select(this).attr("class") !== 'leaf lactive' || !(d3.select(this).attr("class"))) {
            d3.select(this).attr("class","leaf lactive")
            me.cellClicked(d, this)
            d3.select(this).selectAll("text").attr("class","text")
          }
          else {
            d3.select(this).attr("class","leaf not")
            me.cellClicked(d)
            d3.select(this).selectAll("text").attr("class","text")
          }
        })
        .on("mousemove", function(d){
          me.tooltip
            .style("left", ((d.x0 + d.x1) / 2) + "px")
            .style("top", (((d.y0 + d.y1) / 2) - 55) + "px")
            .style("display", "inline-block")
            .html((d.data.id) + "<br>" + (d.data.count) + " customers")
        })
        .on("mouseout", function(d){ me.tooltip.style("display", "none")})
        .attr("transform", function(d) { return "translate(" + d.x0 + "," + d.y0 + ")"; })

      this.rect = this.cell.append("rect")
        .attr("id", function(d) { return d.data.id; })
        .attr("width", function(d) { return d.x1 - d.x0; })
        .attr("height", function(d) { return d.y1 - d.y0; })
        .attr("class", function(d) {
          if (me.selectedBar) {
            if (d.data.id === me.selectedBar) {
              return "leaf lactive"
            } else {
              return "leaf off"
            }
          } else {
            return "leaf not"
          }
        })
        .attr("fill", function(d) {
          return d.data.color;
        });

      this.cell.append("clipPath")
        .attr("id", function(d) {
          return "clip-" + d.data.id; })
        .append("use")
        .attr("xlink:href", function(d) { return "#" + d.data.id; })

      this.cell.append("text")
        .attr("clip-path", function(d) { return "url(#clip-" + d.data.id + ")"; })
        .selectAll("tspan")
        .data(function(d) {
          let g =  d.data.percent + '%'
          return [d.data.id, g];
        })
        .enter().append("tspan")
        .attr("x", 4)
        .attr("y", function(d, i) { return 13 + i * 10; })
        .text(function(d) { return d; });

      this.cell.append("title")
        .text(function(d) {
          return d.data.id + "\n" + format(d.value); })
    },
    handleSelection () {
      var me = this
      console.log(me.selectedBar)
      d3.selectAll('rect')
        .attr("class", function(d) {
          if (d) {
            console.log(d)
            if (d.data) {
              console.log(d)
              if (me.selectedBar) {
                if (d.data.id === me.selectedBar) {
                  return "leaf lactive"
                } else {
                  return "leaf off"
                }
              } else {
                return "leaf not"
              }
            }
          }
        })
        .attr("fill", function(d) {
          if (d) {
            if (me.selectedBar && d.data) {
              if (d.data.id === me.selectedBar) {
                return d.data.color
              } else {
                return 'lightgray'
              }
            } else {
              if (d.data) {
                return d.data.color
              } else {
                return null
              }
            }
          }
        });
    },
    sumBySize (d) {
      return d.count
    },
    cellClicked (d, obh) {
      console.log(d)
      let data = {
        field: 'segment',
        bar: {
          key: d.data.id
        }
      }
      this.$emit('barclicked', data)
    }
  }
}
</script>

<style>
svg {
  margin: 10px;
}

path {
  fill: none;
  stroke: #76BF8A;
  stroke-width: 3px;
}

.lactive {
  stroke-width: 3;
  stroke: yellow;
}

.text {
  stroke-width: 0.25;
  stroke: black;
}

.leaf {
  cursor: pointer;
}

.off {
  opacity: 0.2;
}

.cheader {
  text-align: left;
  position: relative;
  left: 10px;
  margin-bottom: -5px;
  font-size: 1.3rem;
}

</style>

