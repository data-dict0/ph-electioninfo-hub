// Function to get current dimensions based on container width
function getDimensions() {
    const container = d3.select("#generation_province").node();
    // Check if container exists
    if (!container) {
        console.error("Container #generation_province not found");
        return { 
            margin: {top: 40, right: 20, bottom: 70, left: 85},
            width: 450,
            height: 600,
            isMobile: false
        };
    }
    
    const containerWidth = container.getBoundingClientRect().width;
    const isMobile = containerWidth <= 480;
    
    // Set minimum width and height with mobile adjustments
    const minWidth = isMobile ? 300 : 450;
    const minHeight = isMobile ? 400 : 600;
    
    // Calculate new width and height
    const newWidth = Math.max(minWidth, containerWidth);
    const newHeight = isMobile ? 400 : Math.max(minHeight, containerWidth * 0.45);
    
    const margins = {
        top: 40,
        right: isMobile ? 15 : 20,
        bottom: isMobile ? 100 : 70,
        left: isMobile ? 60 : 85
    };
    
    return {
        margin: margins,
        width: newWidth,
        height: newHeight,
        isMobile
    };
}

// Create text container with dropdown
function createTextContainer() {
    // Check if text container already exists
    const existingContainer = d3.select("#text_container");
    if (!existingContainer.empty()) {
        // If it exists, just update the font size based on device
        const dims = getDimensions();
        existingContainer
            .style("font-size", dims.isMobile ? "11px" : "16px");
            
        // Don't remove and recreate - that's causing the dropdown to disappear
        return;
    }
    
    // Only create the container if it doesn't exist
    const dims = getDimensions();
    
    const textContainer = d3.select("#generation_province")
        .append("div")
        .attr("id", "text_container")
        .style("text-align", "center")
        .style("font-family", "Roboto")
        .style("font-size", dims.isMobile ? "11px" : "16px")
        .style("margin", "10px")
        .style("padding", "0 5px");

    textContainer.append("span")
        .text("In ");

    textContainer.append("span")
        .attr("id", "dropdown_container");

    textContainer.append("span")
        .attr("id", "voters_count");
}

// Create SVG with responsive dimensions
function createResponsiveSvg() {
    const dims = getDimensions();
    
    // Check if the container exists
    const container = d3.select("#generation_province");
    if (container.empty()) {
        console.error("Container not found when creating SVG");
        return null;
    }
    
    // Remove existing SVG if it exists
    container.select("svg").remove();
    
    // Create new SVG with explicit viewport settings for mobile
    const svgContainer = container
        .append("svg")
        .attr("width", dims.width)
        .attr("height", dims.height)
        .style("display", "block") // Ensure SVG is displayed
        .style("margin", "0 auto"); // Center the chart
        
    const svg = svgContainer
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
    
    // Calculate total registered voters for the province
    const totalVoters = provinceData.reduce((sum, d) => sum + (+d.registered_voters), 0);
    
    // Update voters count text
    const votersCount = d3.select("#voters_count");
    if (!votersCount.empty()) {
        votersCount.text(`, there are ${totalVoters.toLocaleString()} registered voters for 2025 elections.`);
    }
    
    // Update scales domains
    x.domain(provinceData.map(d => d.generation));
    y.domain([0, d3.max(provinceData, d => +d.registered_voters)]);
    
    // Add axes with responsive styling
    const xAxis = svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .style("font-size", dims.isMobile ? "13px" : "16px")
        .style("font-family", "Roboto")
        .call(d3.axisBottom(x).tickSize(0));

    // Apply different text rotation based on screen size
    if (dims.isMobile) {
        xAxis.selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-45)");
    } else {
        xAxis.selectAll("text")
            .style("text-anchor", "middle")
            .attr("dx", "0")
            .attr("dy", "1em");
    }
    
    svg.append("g")
        .style("font-size", dims.isMobile ? "13px" : "16px")
        .style("font-family", "Roboto")
        .call(d3.axisLeft(y)
            .tickSize(-width)
            .tickSizeOuter(0)
            .ticks(dims.isMobile ? 5 : 5))
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
        .attr("y", d => y(+d.registered_voters))
        .attr("height", d => height - y(+d.registered_voters));
    
    // Add value labels with responsive font size
    svg.selectAll(".bar-label")
        .data(provinceData)
        .enter()
        .append("text")
        .attr("class", "bar-label")
        .style("text-anchor", "middle")
        .style("font-size", dims.isMobile ? "13px" : "15px")
        .style("font-family", "Roboto")
        .style("font-weight", 700)
        .style("paint-order", "stroke")
        .style("stroke", "white")
        .style("stroke-width", dims.isMobile ? "2px" : "3px")
        .style("stroke-linecap", "butt")
        .style("stroke-linejoin", "miter")
        .attr("x", d => x(d.generation) + x.bandwidth() / 2)
        .attr("y", d => y(+d.registered_voters) - 5)
        .text(d => dims.isMobile ? 
            (+d.registered_voters >= 1000000 ? 
                (+(d.registered_voters/1000000).toFixed(1) + 'M') : 
                (+d.registered_voters/1000).toFixed(0) + 'K')
            : (+d.registered_voters).toLocaleString());
}

// Ensure DOM is fully loaded before attaching events
document.addEventListener('DOMContentLoaded', function() {
    // Check if container exists
    const container = document.getElementById('generation_province');
    if (!container) {
        console.error("Container #generation_province not found");
        return;
    }

    // Load the CSV data
    d3.csv('data/2025_by_age_final.csv')
        .then(function(data) {
            // Hide loading message
            const loadingElement = d3.select("#loading");
            if (!loadingElement.empty()) {
                loadingElement.style("display", "none");
            }
            
            // Create text container
            createTextContainer();
            
            // Get unique provinces
            const provinces = [...new Set(data.map(d => d.province))].sort();
            
            // Create and populate dropdown
            const dropdownContainer = d3.select("#dropdown_container");
            if (dropdownContainer.empty()) {
                console.error("Dropdown container not found");
                return;
            }
            
            const dropdown = dropdownContainer
                .append("select")
                .attr("id", "provinceSelect")
                .style("font-family", "Roboto")
                .style("font-size", "inherit")
                .style("font-weight", "bold")
                .style("margin", "0 5px")
                .style("padding", "2px 5px")
                .style("border-radius", "4px")
                .style("max-width", "200px");
                
            dropdown
                .selectAll("option")
                .data(provinces)
                .enter()
                .append("option")
                .text(d => d)
                .attr("value", d => d);
            
            // Initial chart render
            updateChart(data, provinces[0]);
            
            // Track current dimensions to avoid unnecessary redraws
            let lastWidth = window.innerWidth;
            
            // Safe resize handler function
            function handleResize() {
                const currentWidth = window.innerWidth;
                
                // Only update if the width actually changed significantly (>50px)
                if (Math.abs(currentWidth - lastWidth) > 50) {
                    lastWidth = currentWidth;
                    
                    // Get current dropdown value
                    const provinceSelect = document.getElementById("provinceSelect");
                    const currentValue = provinceSelect ? provinceSelect.value : provinces[0];
                    
                    // Update the chart
                    updateChart(data, currentValue);
                }
            }
            
            // Add window resize handler with debounce
            let resizeTimeout;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(handleResize, 250);
            });
            
            // Update chart when selection changes
            dropdown.on("change", function() {
                updateChart(data, this.value);
            });
            
            // Ensure the chart is visible when scrolling on mobile
            // Use IntersectionObserver to track visibility
            const chartObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // If the chart container is visible but SVG is missing, redraw
                        const svgElement = d3.select("#generation_province svg");
                        if (svgElement.empty()) {
                            const provinceSelect = document.getElementById("provinceSelect");
                            const currentValue = provinceSelect ? provinceSelect.value : provinces[0];
                            updateChart(data, currentValue);
                        }
                    }
                });
            }, { threshold: 0.1 });
            
            // Observe the chart container
            chartObserver.observe(container);
        })
        .catch(function(error) {
            console.error('Error loading the data:', error);
            const loadingElement = d3.select("#loading");
            if (!loadingElement.empty()) {
                loadingElement.text("Error loading data. Please check the console for details.");
            }
        });
});