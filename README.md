# sv-ramda-basics
This is a covid19 data fetch and graph script, plotting Italy's regions covid-19 diffusion and death toll. Data fetched from [official italian Protezione Civile repository](https://github.com/pcm-dpc/COVID-19/blob/master/dati-json/dpc-covid19-ita-regioni.json).

Data transformed with pointfree Ramda. Code a bit of a mess because it is still a mix of non-ramda and ramda parts…

Run it by:

```bash  
curl https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-json/dpc-covid19-ita-regioni.json -o covid.json
npm test
gnuplot plot_regions.gnuplot
gnuplot plot_regions_death.gnuplot
```

And if your gnuplot is able to output .pdf, you will have two new plot files in your folder.

The code timeshifts data, so that at day zero all curves have approximately the same number of total positive cases (hardcoded in code to 166 cases, change it when data for less hit regions consolidates, ideally around 400 cases, just like [Mark Handley did in his twitter/wesite](http://nrg.cs.ucl.ac.uk/mjh/covid19/)).
The intent is to have a feeling of if and when regions will catch up with Lombardia, who is leading.
Sigh.

Data of the five most hit regions is shown, together with a a sixth one, Sicilia, my own region. Plotting all 20 of them is too
noisy at the moment.
