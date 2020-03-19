const R = require('ramda')
const fs = require('fs')
const {
    identity, negate, converge, assoc, prop, pick, apply, subtract,
    evolve, values, sum, multiply, dissoc, pipe, divide, map, when
} = R


const date_to_unix = datestring => parseInt((new Date(datestring).getTime() / 1000).toFixed(0))


let datacv = fs.readFileSync('covid.json')
let corona = JSON.parse(datacv)

const regions_set = new Set(corona.map(region => region.denominazione_regione))
const all_regions = Array.from(regions_set)

console.log(all_regions)


const copyfield = (src, dest) => converge(assoc(dest), [prop(src), identity])

const yesterdays_positivi = pipe(
    pick(['totale_attualmente_positivi', 'nuovi_attualmente_positivi']),
    evolve({nuovi_attualmente_positivi: negate}), // change sign to one value so that we will subtract
    values,
    sum, // here i have yesterday's positivi by summing the 2 values in the array
)

const new_positivi_percentage = pipe(
    pick(['totale_attualmente_positivi', 'yesterdays_positivi']),
    values,
    apply(divide), // divide is 2ary function, need apply tu use it on array
    subtract(1),
    multiply(100),
    negate,
)

const enrich_datapoint = pipe(
    converge(assoc('yesterdays_positivi'), [yesterdays_positivi, identity]),
    converge(assoc('new_positivi_percentage'), [new_positivi_percentage, identity]),
    dissoc('yesterdays_positivi'),
)

const enrich_datapoints = map(enrich_datapoint)

const enriched_datapoints = enrich_datapoints(corona)



console.log(enriched_datapoints)




// pick up the most hit regions
const find_coronamax_for_a_region = region =>
  corona.filter(datapoint => datapoint.denominazione_regione == region).
  map(datapoint => datapoint.totale_attualmente_positivi).
  sort((a, b) => b - a)[0] // For descending sort, first element should be the highest


// stamp out what the timeshimax affected people figure is for each region
const maxed_regions = all_regions.map(region => ({regionname:region, maxcorone:find_coronamax_for_a_region(region)}))

console.log(maxed_regions)

let regions = maxed_regions.sort((a, b) => b.maxcorone - a.maxcorone).slice(0, 5).map(region => region.regionname)

console.log(regions)

regions.push('Sicilia')

console.log(regions)



const find_timeshift_for_a_region = (common_hook_value, region) =>
  corona.filter(datapoint => datapoint.denominazione_regione == region && datapoint.totale_attualmente_positivi <= common_hook_value).
  map(datapoint => date_to_unix(datapoint.data)).
  sort((a, b) => b - a)[0] // For descending sort, first element should be the highest timestamp of all elements having positivi < hook
//  filter((timestamp, index, array) => index == 0 || index == array.length-1). // keep just the first and the last
//  reduce((subtractor, current) => subtractor - current)


// figure out what the timeshift is for each region
// It first creates an array of objects, with region_name and its timeshift,
// then assigns all objects of the array to the first object of the array
// basically merging them into a hashmap object. All object of the areray are
// expanded using the sprea dsyntax
const generate_timeshifts = common_hook_value =>
  Object.assign(...
    // here using the string "region" as key to object
    regions.map(region => ({[region]:find_timeshift_for_a_region(common_hook_value, region)}))
  )


const timeshifts = generate_timeshifts(166) // at least 166 here, Lombardia first value...


console.log(timeshifts)


const timeshift_and_cleanup_a_date_for_a_region = (date, region) => {
    return (date_to_unix(date) - timeshifts[region]) / 86400
//  d = new Date((date_to_unix(date) - timeshifts[region]) * 1000)
//  return (d.getMonth()+1).toString() + "-" + d.getDate().toString()
//  return d.toString()
}

// the last replace uses the regexp /,/g
// where g is the global flag to replace ALL commas in the resulting big string with void.
// Also the "data" (timestamp) field is split and just the day and not the hour is used
// Please notice the newlines to space apart the plots in gnuplots input format
// NOT USED ANYMORE, switched to integer X axis instead of string of dates
const output = regions.map(region => `TIME ${region}
`+corona.filter(datapoint => datapoint.denominazione_regione == region).
map(datapoint => `${timeshift_and_cleanup_a_date_for_a_region(datapoint.data, region)} ${datapoint.totale_attualmente_positivi}
`).toString()+`


`).toString().replace(/,/g,'').replace(/2020-/g,'') // NOT USED



//console.log(output)



fs.writeFile('corona_regions_output.txt', output, (err) => { 
        if (err) throw err; 
    })



const death_output = regions.map(region => `TIME ${region}
`+corona.filter(datapoint => datapoint.denominazione_regione == region).
map(datapoint => `${timeshift_and_cleanup_a_date_for_a_region(datapoint.data, region)} ${datapoint.deceduti}
`).toString()+`


`).toString().replace(/,/g,'')

fs.writeFile('corona_regions_death_output.txt', death_output, (err) => { 
        if (err) throw err; 
    })