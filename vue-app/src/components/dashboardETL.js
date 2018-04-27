import * as d3 from 'd3'
export function sortStates (data, sortBy, selected) {
  if (!selected) {
    let rs = data.sort(function (x, y) {
      return d3.descending(x.customers, y.customers)
    }).map(function (st, i) {
      st.index = i + 1
      st.bar = {
        field: 'state',
        bar: {
          key: st.key
        }
      }
      return st
    })
    return rs.slice(0, 5)
  } else {
    let currentState = null
    data.map(function (d) {
      if (d.key === selected) {
        currentState = d
      }
    })
    return [currentState]
  }
}
// export function sortStates (data, totals, totalScope) {
//  console.log(data)
//  let rs = data.sort(function (x, y) {
//    return d3.descending(x.customers, y.customers)
//  }).map(function (st, i) {
//    let tobj = totals[st.key]
//    st.index = i + 1
//    if (totalScope !== 100000) {
//      st.customer_density = st.customers / tobj.population
//      st.proportion = st.customers / tobj.total
//      st.total = st.customers
//    } else {
//      st.customer_density = tobj.customer_density
//      st.total = st.customers
//      st.proportion = tobj.proportion
//    }
//    st.bar = {
//      field: 'state',
//      bar: {
//        key: st.key
//      }
//    }
//    return st
//  })
//
//  return rs.slice(0, 5)
// }

export function makeTotals (data, pop) {
  const g = data
  let totalDict = {}
  let t = g.map(function (st) {
    st.population = pop[st.key]
    st.population_ratio = Math.floor((pop[st.key] / 326766748) * 100) / 100
    st.customer_density = st.customers / st.population
    st.total = st.customers
    st.proportion = st.customers / 100000
    totalDict[st.key] = st
    return st
  })
  console.log(t)
  return totalDict
}
export function customerEtl (data) {
  return data.map(cu => {
    if (cu.is_smoker === '1') {
      cu.smokes = 'Yes'
    } else if (cu.is_smoker === ' ') {
      cu.smokes = 'No'
    } else {
      console.log(cu)
      cu.smokes = 'No'
    }
    if (cu.is_exerciser === '1') {
      cu.exercises = 'Yes'
    } else {
      cu.exercises = 'No'
    }
    if (cu.education === 'Attended Vocational/Technical') {
      cu.education = 'High School'
    }
    if (cu.education === 'Completed High School') {
      cu.education = 'High School'
    }
    if (cu.education === 'Completed College') {
      cu.education = 'College'
    }
    if (cu.education === 'Completed Graduate School') {
      cu.education = 'Graduate School'
    }
    cu.disposable_income = cu.travel_spend_bucket + cu.sports_leisure_spend_bucket
    if (cu.disposable_income >= 1000) {
      cu.disposable_income = 1000
    } else {
      cu.disposable_income = cu.disposable_income
    }
    cu.income = cu.income_bucket
    if (cu.income >= 250) {
      cu.income = 250
    } else {
      cu.income = cu.income
    }
    return cu
  })
}
