     // Set up the dimensions
     const margin_param = {top: 20, right: 20, bottom: 70, left: 50};
     const width_param = 1200 - margin_param.left - margin_param.right;
     const height_param = 550 - margin_param.top - margin_param.bottom;

     // Create SVG
     const svg_a = d3.select("#age_province")
         .append("svg")
         .attr("width_param", width_param + margin_param.left + margin_param.right)
         .attr("height_param", height_param + margin_param.top + margin_param.bottom)
         .append("g")
         .attr("transform", `translate(${margin_param.left},${margin_param.top})`);

     // Create scales
     const x2 = d3.scaleBand()
         .range([0, width_param])
         .padding(0.3);

     const y2 = d3.scaleLinear()
         .range([height_param, 0])

     // Add axes
     const xAxis2 = svg_a.append("g")
         .attr("transform", `translate(0,${height_param})`)
         .style('font-size', '16px')
         .style('font-family', 'Roboto')
    
    const yAxis2 = svg_a.append("g")
        .style('font-size', '16px')
        .style('font-family', 'Roboto')


    //  // Add axis labels
    //  svg.append("text")
    //      .attr("class", "axis-label")
    //      .attr("text-anchor", "middle")
    //      .attr("x", width_param / 2)
    //      .attr("y", height_param + 40)
    //      .text("Generation");

    //  svg.append("text")
    //      .attr("class", "axis-label")
    //      .attr("text-anchor", "middle")
    //      .attr("transform", "rotate(-90)")
    //      .attr("x", -height_param / 2)
    //      .attr("y", -40)
    //      .text("Number of Voters");


     // Function to update the chart
     function updateChart2(data, province) {
         // Filter data for selected province
         const provinceData2 = data.filter(d => d.province === province);

         // Update scales
         x2.domain(provinceData2.map(d => d.age));
         y2.domain([0, d3.max(provinceData2, d => +d.registered_2022)]);

         // Update axes
         xAxis2.transition()
             .duration(1000)
             .call(d3
                .axisBottom(x2)
                .tickSize(0))
             .selectAll("text")
             .style("text-anchor", "middle")
             .attr("dx", "-.2em")
             .attr("dy", "1em")

         yAxis2.transition()
             .duration(1000)
             .call(d3
                .axisLeft(y2)
                .tickSize(-width_param)
                .tickSizeOuter(0)
                .ticks(5))
                .select(".domain").remove();
             


         // Update bars
         const bars2 = svg_a.selectAll(".bar")
             .data(provinceData2);

         // Remove old bars
         bars2.exit().remove();

         // Add new bars
         const barsEnter2 = bars2.enter()
             .append("rect")
             .attr("class", "bar")
             .attr("fill", "#dda448");

         // Update and transition bars
         bars2.merge(barsEnter2)
             .transition()
             .duration(1000)
             .attr("x", d => x2(d.age))
             .attr("width_param", x2.bandwidth())
             .attr("y", d => y2(+d.registered_2022))
             .attr("height_param", d => height_param - y2(+d.registered_2022));
     }

     // Load the CSV data
     d3.csv('data/province_age.csv')
         .then(function(data) {
             // Hide loading message and show dropdown
             d3.select("#loading_age").style("display", "none");
             d3.select("#provinceageSelect").style("display", "block");

             // Get unique provinces from the data
             const provinces2 = [...new Set(data.map(d => d.province))].sort();

             // Populate dropdown
             const dropdown2 = d3.select("#provinceageSelect");
             dropdown2
                 .selectAll("option")
                 .data(provinces2)
                 .enter()
                 .append("option")
                 .text(d => d)
                 .attr("value", d => d);

             // Initial chart render
             updateChart2(data, provinces2[0]);

             // Update chart when selection changes
             dropdown2.on("change", function() {
                 updateChart2(data, this.value);
             });
         })
         .catch(function(error) {
             // Handle any errors loading the data
             console.error('Error loading the data:', error);
             d3.select("#loading")
                 .text("Error loading data. Please check the console for details.");
         });