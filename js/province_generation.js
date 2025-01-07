// Set up the dimensions
const margin = { top: 20, right: 20, bottom: 70, left: 75 };
const width = 1200 - margin.left - margin.right;
const height = 550 - margin.top - margin.bottom;

// Create SVG
const svg = d3.select("#generation_province")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Create scales
const x = d3.scaleBand()
    .range([0, width])
    .padding(0.3);

const y = d3.scaleLinear()
    .range([height, 0])

// Add axes
const xAxis = svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .style('font-size', '16px')
    .style('font-family', 'Roboto')

const yAxis = svg.append("g")
    .style('font-size', '16px')
    .style('font-family', 'Roboto')


//  // Add axis labels
//  svg.append("text")
//      .attr("class", "axis-label")
//      .attr("text-anchor", "middle")
//      .attr("x", width / 2)
//      .attr("y", height + 40)
//      .text("Generation");

//  svg.append("text")
//      .attr("class", "axis-label")
//      .attr("text-anchor", "middle")
//      .attr("transform", "rotate(-90)")
//      .attr("x", -height / 2)
//      .attr("y", -40)
//      .text("Number of Voters");


// Function to update the chart
function updateChart(data, province) {
    // Filter data for selected province
    const provinceData = data.filter(d => d.province === province);

    // Update scales
    x.domain(provinceData.map(d => d.generation));
    y.domain([0, d3.max(provinceData, d => +d.registered_2022)]);

    // Update axes
    xAxis.transition()
        .duration(1000)
        .call(d3
            .axisBottom(x)
            .tickSize(0))
        .selectAll("text")
        .style("text-anchor", "middle")
        .attr("dx", "-.2em")
        .attr("dy", "1em")

    yAxis.transition()
        .duration(1000)
        .call(d3
            .axisLeft(y)
            .tickSize(-width)
            .tickSizeOuter(0)
            .ticks(5))
        .select(".domain").remove();



    // Update bars
    const bars = svg.selectAll(".bar")
        .data(provinceData);

    // Remove old bars
    bars.exit().remove();

    // Add new bars
    const barsEnter = bars.enter()
        .append("rect")
        .attr("class", "bar")
        .attr("fill", "#5e4fa2");

    // Update and transition bars
    bars.merge(barsEnter)
        .transition()
        .duration(1000)
        .attr("x", d => x(d.generation))
        .attr("width", x.bandwidth())
        .attr("y", d => y(+d.registered_2022))
        .attr("height", d => height - y(+d.registered_2022));


    // Update value labels
    const labels = svg.selectAll(".bar-label")
        .data(provinceData);

    // Remove old labels
    labels.exit().remove();

    // Add new labels
    const labelsEnter = labels.enter()
        .append("text")
        .attr("class", "bar-label")
        .style("text-anchor", "middle")
        .style("font-size", "13px")
        .style("font-family", "Roboto")
        .style("font-weight", 700);

    // Update and transition labels
    labels.merge(labelsEnter)
        .transition()
        .duration(1000)
        .attr("x", d => x(d.generation) + x.bandwidth() / 2)
        .attr("y", d => y(+d.registered_2022) - 5)
        .text(d => (+d.registered_2022).toLocaleString());

}

// Load the CSV data
d3.csv('data/province_csv.csv')
    .then(function (data) {
        // Hide loading message and show dropdown
        d3.select("#loading").style("display", "none");
        d3.select("#provinceSelect").style("display", "block");

        // Get unique provinces from the data
        const provinces = [...new Set(data.map(d => d.province))].sort();

        // Populate dropdown
        const dropdown = d3.select("#provinceSelect");
        dropdown
            .selectAll("option")
            .data(provinces)
            .enter()
            .append("option")
            .text(d => d)
            .attr("value", d => d);

        // Initial chart render
        updateChart(data, provinces[0]);

        // Update chart when selection changes
        dropdown.on("change", function () {
            updateChart(data, this.value);
        });
    })
    .catch(function (error) {
        // Handle any errors loading the data
        console.error('Error loading the data:', error);
        d3.select("#loading")
            .text("Error loading data. Please check the console for details.");
    });