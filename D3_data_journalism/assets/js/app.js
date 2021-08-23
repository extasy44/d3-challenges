const app = () => {
  const svgWidth = 800;
  const svgHeight = 500;
  const chosenXAxis = 'poverty';
  const chosenYAxis = 'healthcare';

  const margin = {
    top: 60,
    right: 60,
    bottom: 60,
    left: 60,
  };

  const chartWidth = svgWidth - margin.left - margin.right;
  const chartHeight = svgHeight - margin.top - margin.bottom;

  const chart = d3.select('#scatter');

  const svg = chart
    .append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight);
  const chartGroup = svg
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  d3.csv('./assets/data/data.csv').then((data) => {
    console.log(data);

    data.forEach((row) => {
      row.obesity = +row.obesity;
      row.income = +row.income;
      row.smokes = +row.smokes;
      row.age = +row.age;
      row.healthcare = +row.healthcare;
      row.poverty = +row.poverty;
    });

    const xLinearScale = d3
      .scaleLinear()
      .domain([
        d3.min(data, (d) => d[chosenXAxis]) * 0.8,
        d3.max(data, (d) => d[chosenXAxis]) * 1.2,
      ])
      .range([0, chartWidth]);

    svg
      .append('g')
      .attr('transform', 'translate(0,' + chartHeight + ')')
      .call(d3.axisBottom(xLinearScale));

    const yLinearScale = d3
      .scaleLinear()
      .domain([
        d3.min(data, (d) => d[chosenYAxis]) * 0.8,
        d3.max(data, (d) => d[chosenYAxis]) * 1.2,
      ])
      .range([chartHeight, 0]);

    svg.append('g').call(d3.axisLeft(yLinearScale));

    svg
      .append('g')
      .selectAll('dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', function (d) {
        return xLinearScale(d.poverty);
      })
      .attr('cy', function (d) {
        return yLinearScale(d.healthcare);
      })
      .attr('r', 14)
      .style('fill', '#69b3a2')
      .attr('opacity', '.5');

    svg
      .selectAll('.stateText')
      .data(data)
      .enter()
      .append('text')
      .classed('stateText', true)
      .attr('x', (d) => xLinearScale(d.poverty))
      .attr('y', (d) => yLinearScale(d.healthcare))
      .attr('dy', 3)
      .attr('font-size', '10px')
      .text(function (d) {
        return d.abbr;
      });
  });
};

app();
