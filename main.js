const svg = d3.select('svg');
const svgElement = document.getElementById('my-svg');
const svgWidth = svgElement.clientWidth;
const svgHeight = svgElement.clientHeight;

const renderBarChart = (data) => {

    const xValue = (d) => {
        const year = new Date(d[0]);
        
        return year;
    };

    const yValue = (d) => {
        return d[1];
    };

    const chartTitle = "United States GDP";
    const svgMargin = {top: 50, right: 50, bottom: 50, left: 100};
    const innerWidth = svgWidth - svgMargin.left - svgMargin.right;
    const innerHeight = svgHeight -svgMargin.top - svgMargin.bottom;

    const getToolTipText = (year, amount) => {
        let quarter = '';
        let tooltipString = '';
        let tempArray = year.split('-');
        if (tempArray[1] == '01') {
            quarter = 'Q1';
        }
        else if (tempArray[1] == '04') {
            quarter = 'Q2';
        }
        else if (tempArray[1] == '07') {
            quarter = 'Q3';
        }
        else if (tempArray[1] == '10') {
            quarter = 'Q4';
        }

        tooltipString = `${tempArray[0]} ${quarter}: ${amount} Billion`;
        return tooltipString;
    }

    const xScale = d3.scaleTime()
                     .domain([d3.min(data, xValue), d3.max(data, (xValue) => {
                         let xMax = new Date(xValue[0]);
                         xMax.setMonth(xMax.getMonth() + 3);
                         return xMax;
                     })])
                     .range([0, innerWidth])
                     .nice();

    const yScale = d3.scaleLinear()
                     .domain(d3.extent(data, yValue))
                     .range([innerHeight, 0])
                     .nice();

    const g = svg.append('g')
                 .attr('transform', `translate(${svgMargin.left}, ${svgMargin.top})`);
    
    const xAxis = d3.axisBottom(xScale).tickPadding(10).ticks(data.length / (4 * 5));
    const yAxix = d3.axisLeft(yScale).tickPadding(10);

    const xAxisGroup = g.append('g').call(xAxis)
                        .attr("id", "x-axis")
                        .attr('transform', `translate(0, ${innerHeight})`);
    
    const yAxisGroup = g.append('g').call(yAxix).attr("id", "y-axis");

    g.selectAll('rect').data(data)
                       .enter()
                       .append('rect')
                       .attr('class', 'bar')
                       .attr('x', (d) => xScale(xValue(d)))
                       .attr("y", (d) => yScale(yValue(d)))
                       .attr('width', (d) => {
                           return innerWidth / data.length;
                        })
                       .attr('height', (d) => {
                           return innerHeight - yScale(yValue(d))
                        })
                       .attr('data-date', (d, i) => {
                            return data[i][0]
                        })
                       .attr('data-gdp', (d, i) => {
                            return data[i][1]
                        })
                        .on("mouseover", function(d, i) {
                            d3.select(this).classed("highlightBar", true);
                            g.append('text')
                                .attr('class', 'tooltip')
                                .attr('id', 'tooltip')
                                .attr('data-date', (d, i) => {
                                    return data[i][0]
                                })
                                .attr('y', innerHeight / 2)
                                .attr('x', innerWidth / 2)
                                .attr('text-anchor', 'middle')
                                .text( (data) => {
                                    return getToolTipText(d[0], d[1]);
                                });
                        })
                        .on("mouseout", function(d, i) {
                            d3.select(this).classed("highlightBar", false);
                            g.select('.tooltip').remove();
                        });

    yAxisGroup.append('text')
        .attr('class', 'axis-label')
        .attr('x', -innerHeight / 2)
        .attr('y', 50)
        .attr('fill', 'black')
        .attr('transform', 'rotate(-90)')
        .attr('font-weight', 'bold')
        .attr('text-anchor', 'middle')
        .text("Gross Domestic Product");

    g.append('text')
        .attr('class', 'title')
        .attr('id', 'title')
        .attr('y', 50)
        .attr('x', innerWidth / 2)
        .attr('text-anchor', 'middle')
        .text(chartTitle);
    
}


d3.json("us-gdp.json")
    .then( (data) => {
        let gbpData = [];
        let tempGdpData = [];
        
        d3.keys(data.data.forEach( (key) => {
            tempGdpData = [key[0], key[1]];
            gbpData.push(tempGdpData);
        }))

        renderBarChart(gbpData);
    });