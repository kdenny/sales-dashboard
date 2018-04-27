<template>
  <div id="app">
    <Dashboard/>
  </div>
</template>

<script>
import Dashboard from './components/Dashboard.vue'

export default {
  name: 'App',
  components: {
    Dashboard
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
body {
font-family: 'Source Sans Pro', sans-serif;
font: 11px sans-serif;
background-color: #ffffff;
}

/* Legend Position Style */
.legend {
position:absolute;
right:20px;
top:30px;
font-family: 'Raleway', sans-serif;
}

.axis text {
font: 10px sans-serif;
}

.axis line, .axis path {
fill: none;
stroke: #000;
shape-rendering: crispEdges;
}

h1 {
padding: 20px 40px;
}

h2, h3, h4 {
font-family: 'Raleway', sans-serif;
}

.toolTip-map {
position: absolute;
display: none;
min-width: 80px;
height: auto;
background: none repeat scroll 0 0 #ffffff;
border: 1px solid #6F257F;
padding: 14px;
text-align: center;
font-family: 'Raleway', sans-serif;
}
.toolTip-bar {
position: absolute;
display: none;
min-width: 80px;
height: auto;
background: none repeat scroll 0 0 #ffffff;
border: 1px solid #6F257F;
padding: 14px;
text-align: center;
font-family: 'Raleway', sans-serif;
}
.toolTip-tree {
position: absolute;
display: none;
min-width: 80px;
height: auto;
background: none repeat scroll 0 0 #ffffff;
border: 1px solid #6F257F;
padding: 14px;
text-align: center;
font-family: 'Raleway', sans-serif;
}
</style>
