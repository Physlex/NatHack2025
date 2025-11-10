import { useRef, useEffect } from "react";
import * as d3 from "d3";

export function Spectrogram({ data = [] }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) {
      console.log('Spectrogram: No canvas ref');
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Handle empty or invalid data
    if (!data || data.length === 0) {
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#666';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('No spectrogram data available', width / 2, height / 2);
      return;
    }

    // Convert various data formats to 2D array
    let spectrogramMatrix;
    
    if (Array.isArray(data)) {
      if (Array.isArray(data[0])) {
        // Already a 2D array
        spectrogramMatrix = data;
      } else if (typeof data[0] === 'number') {
        // 1D array - convert to 2D by assuming square matrix or single row
        const size = Math.ceil(Math.sqrt(data.length));
        spectrogramMatrix = [];
        for (let i = 0; i < size; i++) {
          spectrogramMatrix[i] = [];
          for (let j = 0; j < size; j++) {
            spectrogramMatrix[i][j] = data[i * size + j] || 0;
          }
        }
      } else {
        // Array of objects - try to extract numeric values
        const values = data.map(item => {
          if (typeof item === 'number') return item;
          if (item && typeof item.value === 'number') return item.value;
          if (item && typeof item.magnitude === 'number') return item.magnitude;
          if (item && typeof item.power === 'number') return item.power;
          return 0;
        });
        const size = Math.ceil(Math.sqrt(values.length));
        spectrogramMatrix = [];
        for (let i = 0; i < size; i++) {
          spectrogramMatrix[i] = [];
          for (let j = 0; j < size; j++) {
            spectrogramMatrix[i][j] = values[i * size + j] || 0;
          }
        }
      }
    } else if (typeof data === 'object' && data !== null) {
      // Object format - try to extract matrix data
      if (data.matrix) {
        spectrogramMatrix = data.matrix;
      } else if (data.data) {
        spectrogramMatrix = data.data;
      } else if (data.values) {
        spectrogramMatrix = data.values;
      } else {
        // Create a small test matrix
        spectrogramMatrix = [[0.1, 0.2, 0.3], [0.4, 0.5, 0.6], [0.7, 0.8, 0.9]];
      }
    } else {
      // Fallback - create a small test matrix
      spectrogramMatrix = [[0.1, 0.2, 0.3], [0.4, 0.5, 0.6], [0.7, 0.8, 0.9]];
    }

    console.log('Spectrogram data:', data);
    console.log('Processed matrix:', spectrogramMatrix);
    console.log('Matrix dimensions:', spectrogramMatrix.length, 'x', spectrogramMatrix[0]?.length || 0);

    const freqBins = spectrogramMatrix.length;
    const timeBins = spectrogramMatrix[0]?.length || 0;

    if (timeBins === 0 || freqBins === 0) {
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#666';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Invalid spectrogram data format', width / 2, height / 2);
      return;
    }

    // Find min/max values for proper scaling
    let minVal = Infinity;
    let maxVal = -Infinity;
    
    for (let i = 0; i < freqBins; i++) {
      for (let j = 0; j < timeBins; j++) {
        const val = Number(spectrogramMatrix[i][j]) || 0;
        minVal = Math.min(minVal, val);
        maxVal = Math.max(maxVal, val);
      }
    }
    
    // Handle case where all values are the same
    if (minVal === maxVal) {
      minVal = Math.max(0, minVal - 0.1);
      maxVal = minVal + 0.2;
    }
    
    console.log('Value range:', minVal, 'to', maxVal);

    const color = d3.scaleSequential(d3.interpolateInferno).domain([minVal, maxVal]);
    const cellWidth = width / timeBins;
    const cellHeight = height / freqBins;

    for (let i = 0; i < freqBins; i++) {
      for (let j = 0; j < timeBins; j++) {
        const value = Number(spectrogramMatrix[i][j]) || 0;
        ctx.fillStyle = color(value);
        ctx.fillRect(j * cellWidth, height - (i + 1) * cellHeight, cellWidth, cellHeight);
      }
    }
    
    console.log('Spectrogram rendered successfully');
  }, [data]);

  return (
    <div className="w-full flex flex-col items-center">
      <canvas ref={canvasRef} width={800} height={400} className="w-full h-auto border rounded" />
      <div className="mt-2 text-sm text-gray-600">
        {data && Array.isArray(data) && data.length > 0 ? 
          `Data points: ${Array.isArray(data[0]) ? `${data.length} × ${data[0]?.length || 0}` : data.length}` : 
          'No data'}
      </div>
    </div>
  );
}

export function Periodogram({ data = [] }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 600;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const validData = data.filter(d => d && typeof d.frequency === 'number' && typeof d.value === 'number').sort((a, b) => a.frequency - b.frequency);
    if (validData.length === 0) return;

    // Create scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(validData, d => d.frequency))
      .range([0, chartWidth]);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(validData, d => d.value)])
      .range([chartHeight, 0]);

    // Create main group for chart content
    const chartGroup = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create clipping path
    const clipPath = svg.append("defs")
      .append("clipPath")
      .attr("id", "chart-clip")
      .append("rect")
      .attr("width", chartWidth)
      .attr("height", chartHeight);

    // Create line generator
    const line = d3.line()
      .x(d => xScale(d.frequency))
      .y(d => yScale(d.value));

    // Create path with clipping
    const pathGroup = chartGroup.append("g")
      .attr("clip-path", "url(#chart-clip)");

    const path = pathGroup.append("path")
      .datum(validData)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Create axes
    const xAxisGroup = chartGroup.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale));

    const yAxisGroup = chartGroup.append("g")
      .call(d3.axisLeft(yScale));

    // Create zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.5, 20])
      .extent([[0, 0], [chartWidth, chartHeight]])
      .on("zoom", function(event) {
        const { transform } = event;
        
        // Update scales
        const newXScale = transform.rescaleX(xScale);
        const newYScale = transform.rescaleY(yScale);
        
        // Update line generator with new scales
        const newLine = d3.line()
          .x(d => newXScale(d.frequency))
          .y(d => newYScale(d.value));
        
        // Update path
        path.attr("d", newLine);
        
        // Update axes
        xAxisGroup.call(d3.axisBottom(newXScale));
        yAxisGroup.call(d3.axisLeft(newYScale));
      });

    // Apply zoom to the chart group
    chartGroup.call(zoom);

    // Add a transparent rectangle to capture zoom events
    chartGroup.append("rect")
      .attr("width", chartWidth)
      .attr("height", chartHeight)
      .style("fill", "none")
      .style("pointer-events", "all");

    // Add reset zoom button
    const resetButton = svg.append("g")
      .attr("transform", "translate(10, 10)")
      .style("cursor", "pointer")
      .on("click", function() {
        chartGroup.transition()
          .duration(750)
          .call(zoom.transform, d3.zoomIdentity);
      });

    resetButton.append("rect")
      .attr("width", 60)
      .attr("height", 20)
      .attr("fill", "#f0f0f0")
      .attr("stroke", "#ccc")
      .attr("rx", 3);

    resetButton.append("text")
      .attr("x", 30)
      .attr("y", 14)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("fill", "#333")
      .text("Reset Zoom");

  }, [data]);

  return <svg ref={svgRef} width={600} height={300} className="w-full h-auto"></svg>;
}

export function ERP({ data = [] }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current) {
      console.log('ERP: No SVG ref');
      return;
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 500;
    const margin = { top: 40, right: 120, bottom: 60, left: 80 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    // Handle empty or invalid data
    if (!data || data.length === 0) {
      const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
      
      g.append("text")
        .attr("x", chartWidth / 2)
        .attr("y", chartHeight / 2)
        .attr("text-anchor", "middle")
        .attr("fill", "#666")
        .style("font-size", "16px")
        .text("No ERP data available");
      return;
    }

    console.log('ERP data:', data);

    // Process the ERP data - handle your specific format
    let processedChannels = [];
    
    if (Array.isArray(data) && data.length > 0) {
      // Handle your specific format: array of objects with id, latency, channel, values
      if (data[0] && data[0].values && Array.isArray(data[0].values)) {
        processedChannels = data.map(erpRecord => {
          const timePoints = erpRecord.values.map((voltage, index) => ({
            time: index * 4 - 200, // Assuming 4ms intervals starting at -200ms (adjust as needed)
            voltage: voltage
          }));
          
          return {
            channel: erpRecord.channel || `Channel ${erpRecord.id}`,
            latency: erpRecord.latency,
            id: erpRecord.id,
            data: timePoints
          };
        });
      }
      // Handle standard format: array of {time, voltage} objects
      else if (data[0] && typeof data[0] === 'object' && 'time' in data[0]) {
        processedChannels = [{
          channel: 'ERP',
          data: data.filter(d => d && typeof d.time === 'number' && typeof (d.voltage || d.amplitude || d.value) === 'number')
            .map(d => ({
              time: d.time,
              voltage: d.voltage || d.amplitude || d.value || 0
            }))
        }];
      }
      // Handle array of voltage values
      else if (typeof data[0] === 'number') {
        processedChannels = [{
          channel: 'ERP',
          data: data.map((voltage, index) => ({
            time: index * 4 - 200,
            voltage: voltage
          }))
        }];
      }
    }

    if (processedChannels.length === 0) {
      const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
      
      g.append("text")
        .attr("x", chartWidth / 2)
        .attr("y", chartHeight / 2)
        .attr("text-anchor", "middle")
        .attr("fill", "#666")
        .style("font-size", "16px")
        .text("Invalid ERP data format");
      return;
    }

    // Get all time and voltage extents across all channels
    let allTimePoints = [];
    let allVoltagePoints = [];
    
    processedChannels.forEach(channel => {
      channel.data.forEach(point => {
        allTimePoints.push(point.time);
        allVoltagePoints.push(point.voltage);
      });
    });

    console.log('Processed channels:', processedChannels);
    console.log('Time range:', d3.extent(allTimePoints));
    console.log('Voltage range:', d3.extent(allVoltagePoints));

    // Create main group
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create scales
    const timeExtent = d3.extent(allTimePoints);
    const voltageExtent = d3.extent(allVoltagePoints);
    
    const x = d3.scaleLinear()
      .domain(timeExtent)
      .range([0, chartWidth]);
    
    const y = d3.scaleLinear()
      .domain(voltageExtent)
      .range([chartHeight, 0]);

    // Color scale for different channels
    const colorScale = d3.scaleOrdinal()
      .domain(processedChannels.map(d => d.channel))
      .range(['#2563eb', '#dc2626', '#059669', '#7c3aed', '#ea580c', '#0891b2']);

    // Add grid lines
    g.selectAll(".grid-line-x")
      .data(x.ticks(10))
      .enter().append("line")
      .attr("class", "grid-line-x")
      .attr("x1", d => x(d))
      .attr("x2", d => x(d))
      .attr("y1", 0)
      .attr("y2", chartHeight)
      .attr("stroke", "#f0f0f0")
      .attr("stroke-width", 1);

    g.selectAll(".grid-line-y")
      .data(y.ticks(8))
      .enter().append("line")
      .attr("class", "grid-line-y")
      .attr("x1", 0)
      .attr("x2", chartWidth)
      .attr("y1", d => y(d))
      .attr("y2", d => y(d))
      .attr("stroke", "#f0f0f0")
      .attr("stroke-width", 1);

    // Add zero line if it's within the voltage range
    if (voltageExtent[0] <= 0 && voltageExtent[1] >= 0) {
      g.append("line")
        .attr("x1", 0)
        .attr("x2", chartWidth)
        .attr("y1", y(0))
        .attr("y2", y(0))
        .attr("stroke", "#666")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "3,3");
    }

    // Add stimulus onset line at time 0 if within range
    if (timeExtent[0] <= 0 && timeExtent[1] >= 0) {
      g.append("line")
        .attr("x1", x(0))
        .attr("x2", x(0))
        .attr("y1", 0)
        .attr("y2", chartHeight)
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .attr("opacity", 0.7);
      
      // Add label for stimulus onset
      g.append("text")
        .attr("x", x(0) + 5)
        .attr("y", 15)
        .attr("fill", "red")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text("Stimulus");
    }

    // Create line generator
    const line = d3.line()
      .x(d => x(d.time))
      .y(d => y(d.voltage))
      .curve(d3.curveBasis);

    // Draw ERP waveforms for each channel
    processedChannels.forEach((channel, index) => {
      const channelData = channel.data.sort((a, b) => a.time - b.time);
      
      // Draw the waveform
      g.append("path")
        .datum(channelData)
        .attr("fill", "none")
        .attr("stroke", colorScale(channel.channel))
        .attr("stroke-width", 2)
        .attr("d", line);

      // Add peak markers for significant deflections
      const peakThreshold = Math.abs(voltageExtent[1] - voltageExtent[0]) * 0.3;
      const peaks = channelData.filter(d => Math.abs(d.voltage) > peakThreshold);
      
      g.selectAll(`.peak-${index}`)
        .data(peaks)
        .enter().append("circle")
        .attr("class", `peak-${index}`)
        .attr("cx", d => x(d.time))
        .attr("cy", d => y(d.voltage))
        .attr("r", 3)
        .attr("fill", colorScale(channel.channel))
        .attr("opacity", 0.7);
    });

    // Add axes
    const xAxis = d3.axisBottom(x)
      .tickFormat(d => `${d}ms`);
    
    const yAxis = d3.axisLeft(y)
      .tickFormat(d => `${d.toFixed(2)}μV`);

    g.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(xAxis)
      .append("text")
      .attr("x", chartWidth / 2)
      .attr("y", 45)
      .attr("fill", "black")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text("Time");

    g.append("g")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -50)
      .attr("x", -chartHeight / 2)
      .attr("fill", "black")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text("Voltage");

    // Add legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width - 110}, ${margin.top})`);

    processedChannels.forEach((channel, index) => {
      const legendItem = legend.append("g")
        .attr("transform", `translate(0, ${index * 25})`);

      legendItem.append("line")
        .attr("x1", 0)
        .attr("x2", 20)
        .attr("y1", 0)
        .attr("y2", 0)
        .attr("stroke", colorScale(channel.channel))
        .attr("stroke-width", 2);

      legendItem.append("text")
        .attr("x", 25)
        .attr("y", 0)
        .attr("dy", "0.35em")
        .style("font-size", "12px")
        .attr("fill", "black")
        .text(`${channel.channel}${channel.latency ? ` (${(channel.latency * 1000).toFixed(0)}ms)` : ''}`);
    });

    // Add title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .attr("fill", "black")
      .text("Event-Related Potentials (ERPs)");

  }, [data]);

  return (
    <div className="w-full flex flex-col items-center">
      <svg ref={svgRef} width={800} height={500} className="w-full h-auto border rounded"></svg>
      <div className="mt-2 text-sm text-gray-600">
        {data && data.length > 0 ? 
          `${data.length} channels${data[0]?.values ? ` × ${data[0].values.length} time points` : ''}` : 
          'No ERP data'}
      </div>
    </div>
  );
}
