// Function to get current dimensions based on container width
function getDimensions() {
    const container = d3.select("#generation_province").node();
    const containerWidth = container.getBoundingClientRect().width;
    
    // Set minimum width and height
    const minWidth = 320;
    const minHeight = 300;
    
    // Calculate new width and height maintaining aspect ratio
    const newWidth = Math.max(minWidth, containerWidth);
    const newHeight = Math.max(minHeight, containerWidth * 0.45); // 45% of width
    
    return {
        margin: {
            top: 20,
            right: 20,
            bottom: newWidth < 600 ? 100 : 70, // Increase bottom margin for smaller screens
            left: newWidth < 600 ? 50 : 75
        },
        width: newWidth,
        height: newHeight
    };
}

// Create SVG with responsive dimensions
function createResponsiveSvg() {
    const dims = getDimensions();
    
    // Clear existing SVG
    d3.select("#generation_province svg").remove();
    
    // Create new SVG
    const svg = d3.select("#generation_province")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${dims.width} ${dims.height}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g")
        .attr("transform", `translate(${dims.margin.left},${dims.margin.top})`);
    
    return svg;
}

// Create scales with responsive dimensions
function createScales(dims) {
    const width = dims.width - dims.margin.left - dims.margin.right;
    const height = dims.height - dims.margin.top - dims.margin.bottom;
    
    const x = d3.scaleBand()
        .range([0, width])
        .padding(0.3);
        
    const y = d3.scaleLinear()
        .range([height, 0]);
        
    return { x, y, width, height };
}

// Function to update the chart
function updateChart(data, province) {
    const dims = getDimensions();
    const svg = createResponsiveSvg();
    const { x, y, width, height } = createScales(dims);
    
    // Filter data for selected province
    const provinceData = data.filter(d => d.province === province);
    
    // Update scales domains
    x.domain(provinceData.map(d => d.generation));
    y.domain([0, d3.max(provinceData, d => +d.registered_2022)]);
    
    // Add axes with responsive styling
    const xAxis = svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .style("font-size", dims.width < 600 ? "12px" : "16px")
        .style("font-family", "Roboto")
        .call(d3.axisBottom(x).tickSize(0))
        .selectAll("text")
        .style("text-anchor", "middle")
        .attr("dx", "-.2em")
        .attr("dy", "1em")
        .attr("transform", dims.width < 600 ? "rotate(-45)" : "rotate(0)");
    
    const yAxis = svg.append("g")
        .style("font-size", dims.width < 600 ? "12px" : "16px")
        .style("font-family", "Roboto")
        .call(d3.axisLeft(y)
            .tickSize(-width)
            .tickSizeOuter(0)
            .ticks(5))
        .select(".domain").remove();
    
    // Add bars
    svg.selectAll(".bar")
        .data(provinceData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("fill", "#5e4fa2")
        .attr("x", d => x(d.generation))
        .attr("width", x.bandwidth())
        .attr("y", d => y(+d.registered_2022))
        .attr("height", d => height - y(+d.registered_2022));
    
    // Add value labels with responsive font size
    svg.selectAll(".bar-label")
        .data(provinceData)
        .enter()
        .append("text")
        .attr("class", "bar-label")
        .style("text-anchor", "middle")
        .style("font-size", dims.width < 600 ? "10px" : "13px")
        .style("font-family", "Roboto")
        .style("font-weight", 700)
        .attr("x", d => x(d.generation) + x.bandwidth() / 2)
        .attr("y", d => y(+d.registered_2022) - 5)
        .text(d => (+d.registered_2022).toLocaleString());
}

// Load the CSV data
d3.csv('data/province_csv.csv')
    .then(function(data) {
        // Hide loading message and show dropdown
        d3.select("#loading").style("display", "none");
        d3.select("#provinceSelect").style("display", "block");
        
        // Get unique provinces
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
        
        // Add window resize handler
        window.addEventListener('resize', () => {
            updateChart(data, dropdown.property("value"));
        });
        
        // Update chart when selection changes
        dropdown.on("change", function() {
            updateChart(data, this.value);
        });
    })
    .catch(function(error) {
        console.error('Error loading the data:', error);
        d3.select("#loading")
            .text("Error loading data. Please check the console for details.");
    });