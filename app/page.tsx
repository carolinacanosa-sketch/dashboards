// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Highcharts from "highcharts";
import * as XLSX from "xlsx";

const HighchartsReact = dynamic(
  () => import("highcharts-react-official"),
  { ssr: false }
);

const themes: Record<string, string[]> = {
  blue: ["#2563eb", "#3b82f6", "#60a5fa"],
  green: ["#16a34a", "#22c55e", "#4ade80"],
  purple: ["#7c3aed", "#a78bfa", "#c4b5fd"],
  orange: ["#ea580c", "#fb923c", "#fdba74"],
};

export default function Home() {
  const [chartType, setChartType] = useState("column");
  const [theme, setTheme] = useState("blue");
  const [chartTitle, setChartTitle] = useState("Matific Marketing Performance");
  const [dataTable, setDataTable] = useState([]);
  const [columns, setColumns] = useState([]);
  const [xAxisCol, setXAxisCol] = useState("");
  const [yAxisCol, setYAxisCol] = useState("");
  const [chartOptions, setChartOptions] = useState({});

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      
      if (data.length > 0) {
        const cols = Object.keys(data[0]);
        setDataTable(data);
        setColumns(cols);
        setXAxisCol(cols[0]); 
        setYAxisCol(cols[1]); 
      }
    };
    reader.readAsBinaryString(file);
  };

  useEffect(() => {
    if (dataTable.length > 0 && xAxisCol && yAxisCol) {
      setChartOptions({
        chart: { type: chartType },
        title: { text: chartTitle },
        colors: themes[theme],
        xAxis: {
          categories: dataTable.map(item => item[xAxisCol]),
          title: { text: xAxisCol }
        },
        yAxis: {
          title: { text: yAxisCol }
        },
        series: [{
          name: yAxisCol,
          data: dataTable.map(item => Number(item[yAxisCol]) || 0)
        }],
        credits: { enabled: false }
      });
    }
  }, [chartType, theme, chartTitle, dataTable, xAxisCol, yAxisCol]);

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif", backgroundColor: "#f9fafb", minHeight: "100vh" }}>
      <h1 style={{ color: "#111827", marginBottom: "20px" }}>Marketing Chart Generator</h1>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 3fr", gap: "20px" }}>
        <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Upload Data (Excel/CSV)</label>
            <input type="file" onChange={handleFileUpload} accept=".xlsx, .xls, .csv" style={{ width: "100%" }} />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Chart Title</label>
            <input type="text" value={chartTitle} onChange={(e) => setChartTitle(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }} />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Chart Type</label>
            <select value={chartType} onChange={(e) => setChartType(e.target.value)} style={{ width: "100%", padding: "8px" }}>
              <option value="column">Columns</option>
              <option value="line">Line</option>
              <option value="area">Area</option>
              <option value="bar">Bar</option>
            </select>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Theme Color</label>
            <select value={theme} onChange={(e) => setTheme(e.target.value)} style={{ width: "100%", padding: "8px" }}>
              <option value="blue">Matific Blue</option>
              <option value="green">Growth Green</option>
              <option value="purple">Enterprise Purple</option>
              <option value="orange">Warning Orange</option>
            </select>
          </div>

          {columns.length > 0 && (
            <>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>X Axis (Categories)</label>
                <select value={xAxisCol} onChange={(e) => setXAxisCol(e.target.value)} style={{ width: "100%", padding: "8px" }}>
                  {columns.map(col => <option key={col} value={col}>{col}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Y Axis (Values)</label>
                <select value={yAxisCol} onChange={(e) => setYAxisCol(e.target.value)} style={{ width: "100%", padding: "8px" }}>
                  {columns.map(col => <option key={col} value={col}>{col}</option>)}
                </select>
              </div>
            </>
          )}
        </div>

        <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          {dataTable.length > 0 ? (
            <HighchartsReact highcharts={Highcharts} options={chartOptions} />
          ) : (
            <div style={{ textAlign: "center", padding: "100px", color: "#6b7280" }}>
              Upload a file to generate the preview...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
