# sv-ramda-basics
This is a covid19 data fetch and graph script, plotting Italy's regions covid-19 diffusion and death toll. Data fetched form [official italian Protezione Civile repository](https://github.com/pcm-dpc/COVID-19/blob/master/dati-json/dpc-covid19-ita-regioni.json)

Data transformed with pointfree Ramda. Code still a mess because it is still a mix of non-ramda and ramda parts…

Run it by:

```bash  
curl https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-json/dpc-covid19-ita-regioni.json -o covid.json
npm test
gnuplot plot_regions.gnuplot
gnuplot plot_regions_death.gnuplot
```

And if you have a gnuplot able to output .pdf, you will habe two plots in your folder.

The graphs show timeshifted data, so that at day zero all curves have approximately the same number of total positive cases.
The intent is to have a feeling of if and when regions will catch up with Lombardia, who is leading.
Sigh.

Data of the five most hit regions is shown, together with a a sixth one, Sicilia, my own region. Plotting all of them is too
noisy at the moment.
