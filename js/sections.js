var scrollVis = function () {
  var width = 600;
  var height = 520;
  var margin = { top: 0, left: 20, bottom: 40, right: 10 };

  var lastIndex = -1;
  var activeIndex = 0;
  var svgWords = null;
  var gWords = null;
  var transitionTime = 1000;

  var activateFunctions = [];
  var updateFunctions = [];

  var chart = function (selection) {
    selection.each(function ([wordData, hotelData]) {
      weekData = getArrivalData(hotelData);

      svgWords = d3.select(this).selectAll('svg').data([hotelData]);

      var svgE = svgWords.enter().append('svg');

      svgWords = svgWords.merge(svgE);

      svgWords.attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom);

      svgWords.append('g');

      gWords = svgWords.select('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      setupSections();
    });
  };

  function getArrivalData(data) {
    // Aggregate data based on arrival_date_week_number
    var visits = {};

    data.forEach(({ arrival_date_week_number }) => {
      if (!visits[arrival_date_week_number]) {
        visits[arrival_date_week_number] = 1;
      } else {
        visits[arrival_date_week_number] += 1;
      }
    });

    return Object.entries(visits).map(([week, arrivals]) => ({ week, arrivals }));
  }

  var setupSections = function () {
    activateFunctions[0] = showTitle;
    activateFunctions[1] = showFillerTitle;
    activateFunctions[2] = showBookings;
    activateFunctions[3] = showHistPart;
    activateFunctions[4] = showHistAll;
    activateFunctions[5] = showCough;
    activateFunctions[6] = showHistAll;

    for (var i = 0; i < 9; i++) {
      updateFunctions[i] = function () {};
    }

    updateFunctions[7] = updateCough;
  };

  function updateCough(progress) {
    gWords.selectAll('.cough').transition().duration(0).attr('opacity', progress);

    gWords
      .selectAll('.hist')
      .transition('cough')
      .duration(0)
      .style('fill', function (d) {
        return d.x0 >= 14 ? coughColorScale(progress) : '#008080';
      });
  }

  function showTitle() {
    hideAllElements();

    gWords
      .append('text')
      .attr('class', 'title openvis-title')
      .attr('x', width / 2)
      .attr('y', height / 3)
      .attr('font-size', 50)
      .attr('text-anchor', 'middle')
      .text('Weekly Arrivals Data');

    gWords
      .append('text')
      .attr('class', 'sub-title openvis-title')
      .attr('x', width / 2)
      .attr('y', height / 3 + height / 5)
      .attr('font-size', 30)
      .attr('text-anchor', 'middle')

      .text('Analyzing trends over weeks');

    gWords.selectAll('.openvis-title').transition().duration(transitionTime).attr('opacity', 1);
  }

  function showFillerTitle() {
    hideAllElements();

    gWords
      .append('text')
      .attr('class', 'title count-title highlight')
      .attr('x', width / 2)
      .attr('y', height / 3)
      .attr('font-size', 50)
      .attr('text-anchor', 'middle')
      .attr('fill', '#008080')
      .attr('font-weight', 'bold')
      .text('5');

    gWords
      .append('text')
      .attr('class', 'sub-title count-title')
      .attr('x', width / 2)
      .attr('y', height / 3 + height / 5)
      .attr('font-size', 30)
      .attr('text-anchor', 'middle')
      .text('Países');

    gWords.selectAll('.count-title').transition().duration(transitionTime).attr('opacity', 1.0);
  }

  function showBookings() {
    hideAllElements();
    console.log('Show bookings hist', weekData);

    const x = d3
      .scaleBand()
      .domain(weekData.map((d) => d.week))
      .range([0, 500])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(weekData, (d) => d.arrivals)])
      .nice()
      .range([height, 0]);

    console.log('Y', y(), weekData[0], height);

    // Append bars
    gWords
      .selectAll('.bar')
      .data(weekData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => x(d.week))
      .attr('y', (d) => y(d.arrivals))
      .attr('width', 0)
      .attr('height', (d) => height - y(d.arrivals));

    gWords
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .append('text')
      .attr('y', 35)
      .attr('x', width / 2)
      .attr('dy', '.71em')
      .attr('text-anchor', 'middle')
      .attr('fill', 'black')
      .attr('transform', 'rotate(-45)')
      .text('Week');

    gWords
      .append('g')
      .call(d3.axisLeft(y))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -35)
      .attr('x', -height / 2)
      .attr('dy', '.71em')
      .attr('text-anchor', 'middle')
      .attr('fill', 'black')
      .text('Arrivals');

    showBars();
  }

  function showHistAll() {
    // ensure the axis to histogram one
    //showAxis(xAxisHist);

    gWords.selectAll('.cough').transition().duration(0).attr('opacity', 0);

    // named transition to ensure
    // color change is not clobbered
    gWords.selectAll('.hist').transition('color').duration(500).style('fill', '#008080');

    gWords
      .selectAll('.hist')
      .transition()
      .duration(1200)
      .attr('y', function (d) {
        return yHistScale(d.length);
      })
      .attr('height', function (d) {
        return height - yHistScale(d.length);
      })
      .style('opacity', 1.0);
  }

  function showCough() {
    // ensure the axis to histogram one
    //showAxis(xAxisHist);

    gWords
      .selectAll('.hist')
      .transition()
      .duration(transitionTime)
      .attr('y', function (d) {
        return yHistScale(d.length);
      })
      .attr('height', function (d) {
        return height - yHistScale(d.length);
      })
      .style('opacity', 1.0);
  }

  function hideAllElements() {
    // Selects and hides all SVG elements, assuming they may have been created.
    gWords.selectAll('*').style('display', 'none');
  }

  function hideBars() {
    gWords.selectAll('.bar-text').transition().duration(0).attr('opacity', 0);
    gWords.selectAll('.bar').transition().duration(transitionTime).attr('width', 0);
  }

  function showBars() {
    gWords.selectAll('.bar-text').transition().duration(0).attr('opacity', 1);
    gWords.selectAll('.bar').transition().duration(transitionTime).attr('width', 6);
  }

  function showHistPart() {
    console.log('SHOW HIST PART');

    // here we only show a bar if
    // it is before the 15 minute mark
    gWords
      .selectAll('.hist')
      .transition()
      .duration(transitionTime)
      .attr('y', function (d) {
        return d.x0 < 15 ? yHistScale(d.length) : height;
      })
      .attr('height', function (d) {
        return d.x0 < 15 ? height - yHistScale(d.length) : 0;
      })
      .style('opacity', function (d) {
        return d.x0 < 15 ? 1.0 : 1e-6;
      });
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

function display(hotelData, wordsData) {
  var plot = scrollVis();

  d3.select('#vis').datum([wordsData, hotelData]).call(plot);

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

d3.tsv('./data/words.tsv', function (error1, wordsData) {
  d3.csv('./data/hotel_bookings.csv', function (error2, hotelData) {
    display(hotelData, wordsData);
  });
});
