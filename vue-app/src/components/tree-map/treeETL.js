import * as d3 from 'd3'
export function tretl (treeData) {
  let g = treeData
  let td = {
    children: [
    ]
  }
  let colors = ['#f6a39f',
    '#5ecee9',
    '#fd9cba',
    '#90d1a4',
    '#eaa5c3',
    '#dbe9a8',
    '#dcb4e5',
    '#b1bf81',
    '#a4bfeb',
    '#f6d89e',
    '#79cac4',
    '#ecb489',
    '#9dede5',
    '#e3b298',
    '#c3f3ca',
    '#e7b2b7',
    '#a6cca7',
    '#ccba8f',
    '#e3e2b9',
    '#bbc49a']
  let totalScope = d3.sum(g, function (d) {
    return d.customers
  })
  let ct = 0
  let co = 0
  while (ct < g.length) {
    let dg = g[ct]
    if (co > 19) {
      co = 0
    }
    let ccolor = colors[co]
    let j = {
      id: dg.segment,
      name: dg.segment,
      children: [
        {
          count: dg.customers,
          percent: Math.floor((dg.customers / totalScope) * 1000) / 10,
          id: dg.segment,
          name: dg.segment,
          color: ccolor
        }
      ]
    }
    if (dg.customers > 0) {
      td.children.push(j)
      co++
    }
    ct++
  }
  return td
}
