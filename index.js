const ramda = require('ramda')
const fs = require('fs')

let data = fs.readFileSync('students.json')
let students = JSON.parse(data)

const merge_arrays = (a1, a2) => a1.map( (x, i) => [x, a2[i]] )  // why ramda.map does NOT work here?


const extract_scores_of_a_students_results = results => ramda.map(result => result.score, results)

const compute_average_score_of_a_students_scores = scores => ramda.mean(scores)

const true_if_good_average = student_info => student_info[1] > 25


const students_with_averages = merge_arrays(
    ramda.map(student => student.first, students),
    ramda.map(
        compute_average_score_of_a_students_scores,
        ramda.map(
            extract_scores_of_a_students_results, ramda.map(student => student.results, students)
        )
    )
)

console.log( 'WITH GOOD AVERAGE',
students_with_averages.filter(true_if_good_average)
)


console.log( 'MAKING OBJECTD',
students_with_averages.reduce(function(r, e) {
    r['name'] = e[0];
    r['avg'] = e[1];
    return r;
  }, {})
  
)

