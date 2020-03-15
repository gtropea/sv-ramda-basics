const ramda = require('ramda')
const fs = require('fs')

let data = fs.readFileSync('students.json')
let students = JSON.parse(data)


//console.log( 'MIRACLE',

//ramda.map(
//ramda.mean
//,
//ramda.map(
//ramda.map(result => result.score)
//,
//ramda.map(student => student.results, students)
//)
//)
//)


// utility function follows: it uses the second parameter "index" of the .map()'s
// callback signature. Can ramda.map does work here?
const merge_arrays = (a1, a2) => a1.map( (x, i) => [x, a2[i]] ) // WARNING: THIS IS NOT IMMUTABLE


const extract_scores_of_a_students_results = results => ramda.map(result => result.score, results)

const compute_average_score_of_a_students_scores = scores => ramda.mean(scores)

const true_if_good_average = student_info => student_info.avg > 25


const students_with_averages = merge_arrays(
    ramda.map(student => student.first, students),
    ramda.map(
        compute_average_score_of_a_students_scores,
        ramda.map(
            extract_scores_of_a_students_results, ramda.map(student => student.results, students)
        )
    )
)


const averages = students_with_averages.map((e) => {
    r = {};
    r['name'] = e[0];
    r['avg'] = e[1];
    return r;
  })


console.log( 'ALL AVG',
averages
)

console.log( 'GOOD',
ramda.filter(true_if_good_average, averages)
)

console.log( 'BEST',
ramda.pipe(
    ramda.sortWith([ramda.descend(student => student.avg)]),
    ramda.head,
)(averages)
)


const date_to_unix = datestring => parseInt((new Date(datestring).getTime() / 1000).toFixed(0))




let datacv = fs.readFileSync('covid_stripped.json')
let corona = JSON.parse(datacv)

const regions_set = new Set(corona.map(region => region.denominazione_regione))
const all_regions = Array.from(regions_set)


console.log(all_regions)


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
const output = regions.map(region => `TIME ${region}
`+corona.filter(datapoint => datapoint.denominazione_regione == region).
map(datapoint => `${timeshift_and_cleanup_a_date_for_a_region(datapoint.data, region)} ${datapoint.totale_attualmente_positivi}
`).toString()+`


`).toString().replace(/,/g,'').replace(/2020-/g,'')



//console.log(output)



fs.writeFile('corona_regions_output.txt', output, (err) => { 
        if (err) throw err; 
    })