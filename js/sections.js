var scrollVis = function () {
  var width = 500;
  var height = 520;
  var margin = { top: 50, left: 20, bottom: 40, right: 100 };

  var lastIndex = -1;
  var activeIndex = 0;
  var svg = null;
  var g = null;
  var transitionTime = 1000;

  var coughColorScale = d3.scaleLinear().domain([0, 1.0]).range(['#008080', 'red']);

  var activateFunctions = [];
  var updateFunctions = [];

  var chart = function (selection) {
    selection.each(function ([hotelData]) {
      chinaData = getArrivalData(hotelData, 'CN');

      svg = d3.select(this).selectAll('svg').data([hotelData]);
      var svgE = svg.enter().append('svg');
      svg = svg.merge(svgE);
      svg.attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom);
      svg.append('g');

      g = svg.select('g').attr('transform', 'translate(' + margin.right + ',' + margin.top + ')');

      setupSections();
    });
  };

  function getArrivalData(data, desiredCountry) {
    // Aggregate data based on arrival_date_week_number
    var visits = {};

    data.forEach(({ arrival_date_week_number, country }) => {
      if (country === desiredCountry) {
        if (!visits[arrival_date_week_number]) {
          visits[arrival_date_week_number] = 1;
        } else {
          visits[arrival_date_week_number] += 1;
        }
      }
    });

    return Object.entries(visits).map(([week, arrivals]) => ({ week, arrivals }));
  }

  var setupSections = function () {
    activateFunctions[0] = showTitle;
    activateFunctions[1] = showCountriesTitle;
    activateFunctions[2] = showChinaBookings;
    activateFunctions[3] = showAñoNuevoChino;
    activateFunctions[4] = showDiaTrabajador;
    activateFunctions[5] = showVerano;
    activateFunctions[6] = showMedioOtoño;

    for (var i = 0; i < 9; i++) {
      updateFunctions[i] = function () {};
    }

    ///updateFunctions[2] = highlightBars;
    ///updateFunctions[7] = updateChina;
  };

  function addTextAboveWeek(text, posX, posY) {
    const x = d3
      .scaleBand()
      .domain(chinaData.map((d) => d.week))
      .range([0, 500])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(chinaData, (d) => d.arrivals)])
      .nice()
      .range([height, 0]);

    // Filter the data to find the specific week

    console.log('TERT', text);

    // Append the text above the specified week's bar
    g.append('text')
      .attr('class', 'bar-text')
      .attr('x', posX)
      .attr('y', posY) // Position the text slightly above the bar
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', 'black') // Change color as needed
      .transition()
      .duration(4000)
      .attr('opacity', 1)
      .text(text);
  }

  function highlightBars(weeks) {
    console.log('Highlight bars');

    g.selectAll('.bar')
      .filter((d) => {
        return weeks.includes(+d.week);
      })
      .transition()
      .duration(4000)
      .attr('width', 6)
      .style('fill', 'red')
      .attr('opacity', 1);
  }

  function showTitle() {
    showSection('section1');

    g.append('text')
      .attr('class', 'current section1')
      .attr('x', width / 2)
      .attr('y', height / 3)
      .attr('font-size', 50)
      .attr('text-anchor', 'middle')
      .text('Llegadas semanales');

    g.append('text')
      .attr('class', 'current section1')
      .attr('x', width / 2)
      .attr('y', height / 3 + height / 5)
      .attr('font-size', 30)
      .attr('text-anchor', 'middle')

      .text('Analizando las tendencias vacacionales');

    fadeIn('.section1');
  }

  function showCountriesTitle() {
    showSection('section2');

    g.append('text')
      .attr('class', 'section2')
      .attr('x', width / 2)
      .attr('y', height / 3)
      .attr('font-size', 50)
      .attr('text-anchor', 'middle')
      .attr('fill', '#008080')
      .attr('font-weight', 'bold')
      .text('5');

    g.append('text')
      .attr('class', 'section2')
      .attr('x', width / 2)
      .attr('y', height / 3 + height / 5)
      .attr('font-size', 30)
      .attr('text-anchor', 'middle')
      .text('Países');

    fadeIn('.section2');
  }

  function fadeIn(section) {
    g.selectAll(section).transition().duration(transitionTime).attr('opacity', 1.0);
  }

  function showChinaBookings() {
    showSection('section3');

    const x = d3
      .scaleBand()
      .domain(chinaData.map((d) => d.week))
      .range([0, 500])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(chinaData, (d) => d.arrivals)])
      .nice()
      .range([height, 0]);

    // Append bars
    g.selectAll('.bar')
      .data(chinaData)
      .enter()
      .append('rect')
      .attr('class', 'bar section3')
      .attr('x', (d) => x(d.week))
      .attr('y', (d) => y(d.arrivals))
      .attr('width', 6)
      .attr('height', (d) => height - y(d.arrivals));

    const xAxis = g.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x)).attr('class', 'section3');

    const yAxis = g.append('g').call(d3.axisLeft(y)).attr('class', 'section3');

    xAxis
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .attr('dx', '-0.8em')
      .attr('dy', '0.15em')
      .attr('class', 'section3');

    fadeIn('.section3');
  }

  function showAñoNuevoChino() {
    highlightBars([12, 13]);
    addTextAboveWeek('Año nuevo Chino', 115, 280);
  }

  function showDiaTrabajador() {
    highlightBars([21, 22]);
    addTextAboveWeek('Día del trabajador', 200, 0);
  }

  function showVerano() {
    highlightBars([27, 28, 29, 30, 31, 32]);
    addTextAboveWeek('Vacaciones de verano', 277, 45);
  }

  function showMedioOtoño() {
    highlightBars([39]);
    addTextAboveWeek('Festival de Medio Otoño', 380, 90);
  }

  function showSection(selector) {
    const select = `:not(.${selector})`;

    g.selectAll(select).remove();
  }

  chart.activate = function (index) {
    activeIndex = index;
    var sign = activeIndex - lastIndex < 0 ? -1 : 1;
    var scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);

    scrolledSections.forEach(function (i) {
      activateFunctions[i]();
    });

    lastIndex = activeIndex;
  };

  chart.update = function (index, progress) {
    updateFunctions[index](progress);
  };

  return chart;
};

function display(hotelData) {
  var plot = scrollVis();

  d3.select('#vis').datum([hotelData]).call(plot);

  var scroll = scroller().container(d3.select('#graphic'));

  scroll(d3.selectAll('.step'));

  scroll.on('active', function (index) {
    d3.selectAll('.step').style('opacity', function (d, i) {
      return i === index ? 1 : 0.1;
    });

    plot.activate(index);
  });

  scroll.on('progress', function (index, progress) {
    plot.update(index, progress);
  });
}

d3.csv('./data/hotel_bookings.csv', function (error2, hotelData) {
  display(hotelData);
});
