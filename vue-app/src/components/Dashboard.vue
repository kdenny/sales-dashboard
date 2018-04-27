<template>
  <div class="dashboard">
    <h1>Sales & Marketing dashboard</h1>
    <div class="row" style="width: 97%; margin-left: 2.5%; margin-top: -20px;">
      <div class="col-9">
        <div style="margin-bottom: -310px;">
          <div class="cheader" style="margin-left: -22px" v-if="!selected.state">Top States - <span class="switcher-link">by {{ sortBy }}</span></div>
          <div class="cheader" style="margin-left: -22px" v-if="selected.state">{{ selected.state }} curently selected</div>
          <div class="lil-table" v-if="rankedStates" style="height: 295px;">
            <div v-if="!selected.state" v-for="state in rankedStates" v-bind:key="state.key" v-on:click="barClicked(state.bar)"
                 class="card state-card" style="padding: 10px; width: 250px; margin: 5px 0px;">
              {{ state.index }}. {{ state.key }} : {{ state.customers }} customers ( {{ Math.floor((state.customers / totalScope) *100000)/1000  }}%)
            </div>
            <div v-if="selected.state && state.key === selected.state" v-for="state in rankedStates" v-bind:key="state.key" v-on:click="barClicked(state.bar)"
                 class="card state-card" style="padding: 10px; width: 250px; margin: 5px 0px;">
              {{ state.index }}. {{ state.key }} : {{ state.customers }} customers ( {{ Math.floor((state.customers / totalScope) *100000)/1000  }}%)
              <div v-if="populations">Customer density: {{ Math.floor((state.customers / populations[state.key]) *10000)/100  }} </div>
            </div>
          </div>
        </div>
        <div v-if="customerDashboard">
          <tree_map :treeData="customerDashboard.segment" :height="225" :width="300"
                    style="display: inline-block; margin-left: -22px; position: relative; top: 70px;"
                    v-on:barclicked="barClicked" :selectedBar="selected['segment']"
          ></tree_map>
          <geo_map :width="690" :height="475" style="display: inline-block"
                 v-on:barClicked="barClicked" v-on:populations="ingestPopulations" :field="'state'" :chartData="customerDashboard" :selectedBar="selected['state']"
                 ></geo_map>
        </div>
      </div>
      <div class="col-3">
        <div class="cheader">Income</div>
        <div class="card" style="height: 130px; width: 95%; margin-bottom: 20px;">
          <bar_chart :width="320" :height="115" v-if="customerDashboard"
                 :xVar="'income'" :yVar="'customers'" :field="'income'" :increment="25" :endBin="250" :scale="'k'"
                 :chartData="customerDashboard" style="margin-left: 0px; margin-top: 5px;"
                 v-on:barClicked="barClicked"
                 :selectedBar="selected['income']"/>
        </div>
        <div class="cheader">Educational Attainment</div>
        <div class="card" style="height: 190px; width: 95%; margin-bottom: 10px;">
          <row_chart :width="300" :height="165" v-if="customerDashboard"
                 :xVar="'customers'" :yVar="'education'" :field="'education'"
                 :chartData="customerDashboard" style="margin-left: -5px; margin-top: 5px;"
                 v-on:barClicked="barClicked"
                 :selectedBar="selected['education']"/>
        </div>
        <div class="cheader">Leisure Spending</div>
        <div class="card" style="height: 130px; width: 95%; margin-bottom: 10px;">
          <bar_chart :width="310" :height="115" :margin="'{top: 15, right: 10, bottom: 15, left: 10}'" v-if="customerDashboard"
                 :xVar="'disposable_income'" :yVar="'customers'" :field="'disposable_income'" :increment="250" :endBin="1000" :scale="''"
                 :chartData="customerDashboard" style="margin-left: 0px; margin-top: 5px;"
                 v-on:barClicked="barClicked"
                 :selectedBar="selected['disposable_income']"/>
        </div>
        <!--Removed health cards>-->
        <!--<h3>Health</h3>-->
        <!--<div class="card" style="height: 190px; width: 95%;">-->
          <!--<row_chart :width="300" :height="175" :margin="'{top: 0, right: 10, bottom: 5, left: 10}'" v-if="customerDashboard"-->
                 <!--:xVar="'customers'" :yVar="'smokes'" :field="'smokes'"-->
                 <!--:chartData="customerDashboard" style="margin-left: -5px; margin-top: 5px;"-->
                 <!--v-on:barClicked="barClicked"-->
                 <!--:selectedBar="selected['smokes']"/>-->
        <!--</div>-->
        <!--<div class="card" style="height: 300px; width: 95%;">-->
          <!--It would be very easy to add other fields here (< 30 min)-->
        <!--</div>-->
      </div>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3'
import * as universe from 'universe'
import Bar from './bar-chart/BarChart'
import RowChart from './row-chart/RowChart'
import GeoMap from './geo-map/Map'
import TreeMap from './tree-map/TreeMap'
import {customerEtl, sortStates, makeTotals} from './dashboardETL'

export default {
  name: 'MainDashboard',
  components: {
    bar_chart: Bar,
    row_chart: RowChart,
    geo_map: GeoMap,
    tree_map: TreeMap
  },
  watch: {
    customerDashboard () {
      if (this.customerDashboard) {
        this.rankedStates = sortStates(this.customerDashboard.state, this.sortBy, this.selected.state)
      }
    }
  },
  computed: {
    totalScope () {
      var me = this
      if (this.customerDashboard) {
        return d3.sum(me.customerDashboard.income, function (d) {
          return d.customers
        })
      } else {
        return null
      }
    },
    stateTotals () {
      if (this.allStates && this.populations) {
        return makeTotals(this.allStates, this.populations)
      } else {
        return null
      }
    }
  },
  data () {
    return {
      customerData: null,
      queryFrame: null,
      customerDashboard: null,
      rankedStates: null,
      allStates: null,
      populations: null,
      hovered: null,
      sortBy: 'customers',
      selected: {
        state: null,
        income: null,
        education: null,
        disposable_income: null,
        smokes: null,
        exercises: null,
        segment: null
      }
    }
  },
  mounted () {
    this.getCustomerData()
  },
  methods: {
    getCustomerData () {
      let furl = 'http://localhost:5000/api/all'
      var me = this
      this.$http.get(furl).then(response => {
        let currentData = response.body.data
        this.customerData = customerEtl(currentData)
        universe(this.customerData)
          .then(function (myUniverse) {
            myUniverse.onFilter(me.processAggs, 300)
            me.queryFrame = myUniverse
            me.processAggs()
            return myUniverse
          })
      })
    },
    barClicked (data) {
      let bar = data.bar
      var me = this
      const fg = data.bar.key
      let lf = data.field
      if (!me.selected[lf]) {
        if (bar.key !== 0) {
          me.selected[lf] = bar.key
        } else {
          me.selected[lf] = '0'
        }
        me.queryFrame.filter(data.field, fg, true).then(res => {
          me.queryFrame = res
        })
      } else {
        me.selected[lf] = null
        if (data.field === 'income' || data.field === 'disposable_income') {
          me.queryFrame.filterAll().then(res => {
            me.queryFrame = res
          })
        } else {
          me.queryFrame.filter(data.field, null).then(res => {
            me.queryFrame = res
          })
        }
      }
    },
    doAgg (cdata, field) {
      var me = this
      me.queryFrame.query({
        groupBy: field,
        select: {
          $count: true, // Count the number of records,
          customers: { // Create a custom 'customers' column
            $sum: 'customers' // Sum the customers column
          }
        }
      })
        .then(function (res) {
          cdata[field] = res.data.map(d => {
            d[field] = d.key
            d.count = d.value.count
            d.customers = d.value.customers.sum
            return d
          })
          if (field === 'segment') {
            me.customerDashboard = cdata
            me.allStates = me.customerDashboard.state
          }
          return cdata
        })
      return cdata
    },
    ingestPopulations (p) {
      this.populations = p
    },
    processAggs () {
      // eslint-disable-next-line
      let cdata = {}
      cdata = this.doAgg(cdata, 'state')
      cdata = this.doAgg(cdata, 'income')
      cdata = this.doAgg(cdata, 'disposable_income')
      cdata = this.doAgg(cdata, 'education')
      cdata = this.doAgg(cdata, 'segment')

      // Not currently using these, but would be very easy to add
      //      cdata = this.doAgg(cdata, 'smokes')
      //      cdata = this.doAgg(cdata, 'exercises')
    }
    // Work in progress
    //    toggleSort () {
    //      if (this.sortBy === 'customers') {
    //        this.sortBy = 'customer_density'
    //      }
    //    }
    // Removed these due to performance issues
    //    doHover (d) {
    //      this.hovered = d
    //    },
    //    unhover () {
    //      this.hovered = null
    //    }
  }
}
</script>

<style scoped>
  h1 {
    position: relative;
    left: 8%;
  }
  .subheader {
    text-align: center;
    font-size: 1.2rem;
  }
  .cheader {
    text-align: left;
    font-size: 1.3rem;
  }
  .state-card:hover {
    cursor: pointer;
  }
  .state-card {
    font-size: 1.2em;
  }
  .emph {
    font-weight: 500;
    display: inline-block;
  }
  /*@import "../../sass/_variables.scss";*/
  /*@import "./vx.css";*/
</style>
