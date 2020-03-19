# this uses Xlabels from the file
set title "Coronavirus diffusion in Italy's regions"
set label 1 "Data from official repository https://github.com/pcm-dpc/COVID-19" font ",6"
set label 1 at graph 0.02, 0.85 tc lt 3
set label 2 "Giuseppe Tropea giutropea\\@gmail.com" font ",6"
set label 2 at graph 0.02, 0.80 tc lt 3
set style data lines
set ylabel "total positive cases"
set xlabel "days (day 0 is all regions timeshifted to same number of positive cases)" font ",8"
#set autoscale
set autoscale y
set logscale y
set xrange [-5:*]
#set yrange [0:2000]
set key autotitle columnhead
set key font ",6"
set terminal pdf
set output "corona_regions_graph.pdf"
set xtics font ",6"
plot 'corona_regions_output.txt' using 1:2 index 0, \
     ''                          using 1:2 index 1, \
     ''                          using 1:2 index 2, \
     ''                          using 1:2 index 3, \
     ''                          using 1:2 index 4, \
     ''                          using 1:2 index 5