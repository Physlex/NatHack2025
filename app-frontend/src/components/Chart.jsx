import { useRef, useEffect } from "react";
import * as d3 from "d3";

export function Spectrogram({ data = [] }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0 || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const timeBins = data.length > 0 ? data[0].length : 0;
    const freqBins = data.length;

    if (timeBins === 0 || freqBins === 0) return;

    const color = d3.scaleSequential(d3.interpolateInferno).domain([0, 1]);
    const cellWidth = width / timeBins;
    const cellHeight = height / freqBins;

    for (let i = 0; i < freqBins; i++) {
      for (let j = 0; j < timeBins; j++) {
        ctx.fillStyle = color(data[i][j] || 0);
        ctx.fillRect(j * cellWidth, height - (i + 1) * cellHeight, cellWidth, cellHeight);
      }
    }
  }, [data]);

  return <canvas ref={canvasRef} width={600} height={300} className="w-full h-auto" />;
}

export function Periodogram({ data = [] }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 600;
    const height = 300;
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const validData = data.filter(d => d && typeof d.frequency === 'number' && typeof d.power === 'number');
    if (validData.length === 0) return;

    const x = d3.scaleLinear().domain(d3.extent(validData, d => d.frequency)).range([40, width - 20]);
    const y = d3.scaleLinear().domain([0, d3.max(validData, d => d.power)]).range([height - 30, 20]);

    const line = d3.line()
      .x(d => x(d.frequency))
      .y(d => y(d.power));

    svg.append("path")
      .datum(validData)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", line);

    svg.append("g").attr("transform", `translate(0,${height - 30})`).call(d3.axisBottom(x));
    svg.append("g").attr("transform", `translate(40,0)`).call(d3.axisLeft(y));
  }, [data]);

  return <svg ref={svgRef} width={600} height={300} className="w-full h-auto"></svg>;
}

export function ERP({ data = [] }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 600;
    const height = 300;
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const validData = data.filter(d => d && typeof d.time === 'number' && typeof d.voltage === 'number');
    if (validData.length === 0) return;

    const x = d3.scaleLinear().domain(d3.extent(validData, d => d.time)).range([40, width - 20]);
    const y = d3.scaleLinear().domain(d3.extent(validData, d => d.voltage)).range([height - 30, 20]);

    const line = d3.line()
      .x(d => x(d.time))
      .y(d => y(d.voltage))
      .curve(d3.curveBasis);

    svg.append("path")
      .datum(validData)
      .attr("fill", "none")
      .attr("stroke", "green")
      .attr("stroke-width", 2)
      .attr("d", line);

    svg.append("g").attr("transform", `translate(0,${height - 30})`).call(d3.axisBottom(x));
    svg.append("g").attr("transform", `translate(40,0)`).call(d3.axisLeft(y));
  }, [data]);

  return <svg ref={svgRef} width={600} height={300} className="w-full h-auto"></svg>;
}
