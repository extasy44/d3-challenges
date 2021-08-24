const app = () => {
  const svgWidth = 900;
  const svgHeight = 600;
  let initialXAxis = 'poverty';
  let initialYAxis = 'healthcare';

  const margin = {
    top: 100,
    right: 100,
    bottom: 100,
    left: 100,
  };

  const chartWidth = svgWidth - margin.left - margin.right;
  const chartHeight = svgHeight - margin.top - margin.bottom;

  const chart = d3.select('#scatter').append('div').classed('chart', true);

  const svg = chart
    .append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight);

  const chartGroup = svg
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  function renderXAxis(newXScale, xAxis) {
    const bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition().duration(2000).call(bottomAxis);

    return xAxis;
  }

  function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition().duration(2000).call(leftAxis);

    return yAxis;
  }

  function renderCircles(
    circlesGroup,
    newXScale,
    chosenXAxis,
    newYScale,
    chosenYAxis
  ) {
    circlesGroup
      .transition()
      .duration(2000)
      .attr('cx', (data) => newXScale(data[chosenXAxis]))
      .attr('cy', (data) => newYScale(data[chosenYAxis]));

    return circlesGroup;
  }

  function renderText(
    textGroup,
    newXScale,
    chosenXAxis,
    newYScale,
    chosenYAxis
  ) {
    textGroup
      .transition()
      .duration(2000)
      .attr('x', (d) => newXScale(d[chosenXAxis]))
      .attr('y', (d) => newYScale(d[chosenYAxis]));

    return textGroup;
  }

  function xScale(data, chosenXAxis) {
    let xLinearScale = d3
      .scaleLinear()
      .domain([
        d3.min(data, (d) => d[chosenXAxis]) * 0.8,
        d3.max(data, (d) => d[chosenXAxis]) * 1.2,
      ])
      .range([0, chartWidth]);

    return xLinearScale;
  }

  function yScale(data, chosenYAxis) {
    let yLinearScale = d3
      .scaleLinear()
      .domain([
        d3.min(data, (d) => d[chosenYAxis]) * 0.8,
        d3.max(data, (d) => d[chosenYAxis]) * 1.2,
      ])
      .range([chartHeight, 0]);

    return yLinearScale;
  }

  function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
    const xLabels = {
      poverty: 'Poverty: ',
      income: 'Median Income: ',
      age: 'Age: ',
    };

    const xLabel = xLabels[chosenXAxis] || 'Poverty: ';

    const yLabels = {
      healthcare: 'No Healthcare: ',
      obesity: 'Obesity: ',
      smokes: 'Smokers: ',
    };

    const yLabel = yLabels[chosenYAxis] || 'No Healthcare: ';

    const toolTip = d3
      .tip()
      .attr('class', 'd3-tip')
      .offset([-5, 0])
      .html(function (d) {
        return `${d.state}<br>${xLabel} ${chosenXAxis}<br>${yLabel} ${d[chosenYAxis]}%`;
      });

    circlesGroup.call(toolTip);

    circlesGroup.on('mouseover', toolTip.show).on('mouseout', toolTip.hide);

    return circlesGroup;
  }

  d3.csv('./assets/data/data.csv').then((data) => {
    data.forEach((row) => {
      row.obesity = +row.obesity;
      row.income = +row.income;
      row.smokes = +row.smokes;
      row.age = +row.age;
      row.healthcare = +row.healthcare;
      row.poverty = +row.poverty;
    });

    let xLinearScale = d3
      .scaleLinear()
      .domain([
        d3.min(data, (d) => d[initialXAxis] * 0.8),
        d3.max(data, (d) => d[initialXAxis] * 1.2),
      ])
      .range([0, chartWidth]);

    let yLinearScale = d3
      .scaleLinear()
      .domain([
        d3.min(data, (d) => d[initialYAxis] * 0.8),
        d3.max(data, (d) => d[initialYAxis] * 1.2),
      ])
      .range([chartHeight, 0]);

    const bottomAxis = d3.axisBottom(xLinearScale);
    const leftAxis = d3.axisLeft(yLinearScale);

    let xAxis = chartGroup
      .append('g')
      .classed('x-axis', true)
      .attr('transform', `translate(0, ${chartHeight})`)
      .call(bottomAxis);

    let yAxis = chartGroup.append('g').classed('y-axis', true).call(leftAxis);

    let circlesGroup = chartGroup
      .selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .classed('stateCircle', true)
      .attr('cx', (d) => xLinearScale(d[initialXAxis]))
      .attr('cy', (d) => yLinearScale(d[initialYAxis]))
      .attr('r', 14)
      .attr('opacity', '.5');

    let textGroup = chartGroup
      .selectAll('.stateText')
      .data(data)
      .enter()
      .append('text')
      .classed('stateText', true)
      .attr('x', (d) => xLinearScale(d[initialXAxis]))
      .attr('y', (d) => yLinearScale(d[initialYAxis]))
      .attr('dy', 3)
      .attr('font-size', '10px')
      .text(function (d) {
        return d.abbr;
      });

    const yLabelGroup = chartGroup
      .append('g')
      .attr('transform', `translate(${-40}, ${chartHeight / 2.5})`);

    const healthCareLabel = yLabelGroup
      .append('text')
      .classed('aText', true)
      .classed('active', true)
      .attr('x', 0)
      .attr('y', 0 - 20)
      .attr('dy', '1em')
      .attr('transform', 'rotate(-90)')
      .attr('value', 'healthcare')
      .text('Without Healthcare (%)');

    const smokesLabel = yLabelGroup
      .append('text')
      .classed('aText', true)
      .classed('inactive', true)
      .attr('x', 0)
      .attr('y', 0 - 40)
      .attr('dy', '1em')
      .attr('transform', 'rotate(-90)')
      .attr('value', 'smokes')
      .text('Smoker (%)');

    const obesityLabel = yLabelGroup
      .append('text')
      .classed('aText', true)
      .classed('inactive', true)
      .attr('x', 0)
      .attr('y', 0 - 60)
      .attr('dy', '1em')
      .attr('transform', 'rotate(-90)')
      .attr('value', 'obesity')
      .text('Obese (%)');

    const xLabelGroup = chartGroup
      .append('g')
      .attr(
        'transform',
        `translate(${chartWidth / 2}, ${chartHeight + margin.top})`
      );

    const povertyLabel = xLabelGroup
      .append('text')
      .classed('aText', true)
      .classed('active', true)
      .attr('x', 0)
      .attr('y', -60)
      .attr('value', 'poverty')
      .text('In Poverty (%)');

    const ageLabel = xLabelGroup
      .append('text')
      .classed('aText', true)
      .classed('inactive', true)
      .attr('x', 0)
      .attr('y', -40)
      .attr('value', 'age')
      .text('Age (Median)');

    const incomeLabel = xLabelGroup
      .append('text')
      .classed('aText', true)
      .classed('inactive', true)
      .attr('x', 0)
      .attr('y', -20)
      .attr('value', 'income')
      .text('Household Income (Median)');

    circlesGroup = updateToolTip(initialXAxis, initialYAxis, circlesGroup);

    xLabelGroup.selectAll('text').on('click', function () {
      const value = d3.select(this).attr('value');

      if (value != initialXAxis) {
        initialXAxis = value;

        xLinearScale = xScale(data, initialXAxis);
        xAxis = renderXAxis(xLinearScale, xAxis);

        circlesGroup = renderCircles(
          circlesGroup,
          xLinearScale,
          initialXAxis,
          yLinearScale,
          initialYAxis
        );

        textGroup = renderText(
          textGroup,
          xLinearScale,
          initialXAxis,
          yLinearScale,
          initialYAxis
        );

        circlesGroup = updateToolTip(initialXAxis, initialYAxis, circlesGroup);

        if (initialXAxis === 'poverty') {
          povertyLabel.classed('active', true).classed('inactive', false);
          ageLabel.classed('active', false).classed('inactive', true);
          incomeLabel.classed('active', false).classed('inactive', true);
        } else if (initialXAxis === 'age') {
          povertyLabel.classed('active', false).classed('inactive', true);
          ageLabel.classed('active', true).classed('inactive', false);
          incomeLabel.classed('active', false).classed('inactive', true);
        } else {
          povertyLabel.classed('active', false).classed('inactive', true);
          ageLabel.classed('active', false).classed('inactive', true);
          incomeLabel.classed('active', true).classed('inactive', false);
        }
      }
    });

    yLabelGroup.selectAll('text').on('click', function () {
      const value = d3.select(this).attr('value');

      if (value != initialYAxis) {
        initialYAxis = value;

        yLinearScale = yScale(data, initialYAxis);

        yAxis = renderYAxis(yLinearScale, yAxis);

        circlesGroup = renderCircles(
          circlesGroup,
          xLinearScale,
          initialXAxis,
          yLinearScale,
          initialYAxis
        );

        textGroup = renderText(
          textGroup,
          xLinearScale,
          initialXAxis,
          yLinearScale,
          initialYAxis
        );

        circlesGroup = updateToolTip(initialXAxis, initialYAxis, circlesGroup);

        if (initialYAxis === 'obesity') {
          obesityLabel.classed('active', true).classed('inactive', false);
          smokesLabel.classed('active', false).classed('inactive', true);
          healthCareLabel.classed('active', false).classed('inactive', true);
        } else if (initialYAxis === 'smokes') {
          obesityLabel.classed('active', false).classed('inactive', true);
          smokesLabel.classed('active', true).classed('inactive', false);
          healthCareLabel.classed('active', false).classed('inactive', true);
        } else {
          obesityLabel.classed('active', false).classed('inactive', true);
          smokesLabel.classed('active', false).classed('inactive', true);
          healthCareLabel.classed('active', true).classed('inactive', false);
        }
      }
    });
  });
};

app();
