// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import * as XLSX from "xlsx";
import Highcharts from "highcharts";

const HighchartsReact = dynamic(
  () => import("highcharts-react-official"),
  { ssr: false }
);

const themes = {
  matificDefault: ["#2563eb", "#ea580c", "#10b981", "#8b5cf6", "#f59e0b"],
  matificBlues: ["#1e3a8a", "#1d4ed8", "#3b82f6", "#93c5fd", "#eff6ff"],
  executiveDark: ["#111827", "#374151", "#4b5563", "#6b7280", "#9ca3af"]
};

export default function Home() {
  const [chartType, setChartType] = useState("column");
  const [theme, setTheme] = useState("matificDefault");
  const [chartTitle, setChartTitle] = useState("Executive Performance Overview");
  const [dataTable, setDataTable] = useState([]);
  const [columns, setColumns] = useState([]);
  const [xAxisCol, setXAxisCol] = useState("");
  const [yAxisCol, setYAxisCol] = useState("");
  const [sheetUrl, setSheetUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chartOptions, setChartOptions] = useState({});

  // SOLUCIÓN AL ERROR DE VERCEL: Cargar módulos de exportación de forma dinámica solo en el cliente
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("highcharts/modules/exporting").then((mod) => mod.default(Highcharts));
      import("highcharts/modules/export-data").then((mod) => mod.default(Highcharts));
    }
  }, []);

  const processData = (data) => {
    if (data.length > 0) {
      const cols = Object.keys(data[0]);
      setDataTable(data);
      setColumns(cols);
      setXAxisCol(cols[0]); 
      setYAxisCol(cols[1] || cols[0]); 
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(wb.Sheets[wsname]);
      processData(data);
    };
    reader.readAsBinaryString(file);
  };

  const fetchGoogleSheet = async () => {
    if (!sheetUrl) return;
    setIsLoading(true);
    try {
      const response = await fetch(sheetUrl);
      const csvText = await response.text();
      const wb = XLSX.read(csvText, { type: "string" });
      const wsname = wb.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(wb.Sheets[wsname]);
      processData(data);
    } catch (error) {
      alert("Error loading Google Sheet. Please ensure it is 'Published to the web' as a CSV format.");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (dataTable.length > 0 && xAxisCol && yAxisCol) {
      const isPie = chartType === "pie" || chartType === "doughnut";
      
      let seriesData = [];
      if (isPie) {
        seriesData = dataTable.map(item => ({
          name: String(item[xAxisCol]),
          y: Number(item[yAxisCol]) || 0
        }));
      } else {
        seriesData = dataTable.map(item => Number(item[yAxisCol]) || 0);
      }

      setChartOptions({
        chart: { 
          type: chartType === "doughnut" ? "pie" : chartType,
          style: { fontFamily: 'Inter, sans-serif' },
          backgroundColor: 'transparent'
        },
        title: { 
          text: chartTitle,
          style: { fontWeight: 'bold', color: '#1f2937' }
        },
        colors: themes[theme],
        exporting: {
          enabled: true,
          buttons: {
            contextButton: {
              menuItems: ["downloadPNG", "downloadPDF", "separator", "downloadCSV"]
            }
          }
        },
        xAxis: {
          categories: isPie ? undefined : dataTable.map(item => String(item[xAxisCol])),
          title: { text: isPie ? null : xAxisCol }
        },
        yAxis: {
          title: { text: yAxisCol }
        },
        plotOptions: {
          pie: {
            innerSize: chartType === "doughnut" ? '50%' : '0%',
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: { enabled: true, format: '<b>{point.name}</b>: {point.percentage:.1f} %' }
          }
        },
        series: [{
          name: yAxisCol,
          colorByPoint: isPie,
          data: seriesData
        }],
        credits: { 
          enabled: true,
          text: 'Matific Data Hub',
          href: '#'
        }
      });
    }
  }, [chartType, theme, chartTitle, dataTable, xAxisCol, yAxisCol]);

  return (
    <div style={{ backgroundColor: "#f3f4f6", minHeight: "100vh", padding: "40px 20px", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", borderBottom: "2px solid #e5e7eb", paddingBottom: "20px" }}>
          <div>
            <h1 style={{ color: "#1e3a8a", margin: 0, fontSize: "28px", fontWeight: "bold" }}>Enterprise Data Visualizer</h1>
            <p style={{ color: "#6b7280", margin: "5px 0 0 0" }}>Create high-fidelity executive reports</p>
          </div>
          <div style={{ backgroundColor: "#ea580c", color: "white", padding: "8px 16px", borderRadius: "20px", fontWeight: "bold", fontSize: "14px" }}>
            PRO VERSION
          </div>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 3fr", gap: "30px" }}>
          
          <div style={{ backgroundColor: "white", padding: "25px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}>
            <h3 style={{ marginTop: 0, color: "#1f2937", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>Data Source</h3>
            
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "bold", marginBottom: "5px", color: "#4b5563" }}>1. Upload Local File</label>
              <input type="file" onChange={handleFileUpload} accept=".xlsx, .xls, .csv" style={{ width: "100%", fontSize: "14px" }} />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "bold", marginBottom: "5px", color: "#4b5563" }}>2. Or Google Sheets URL</label>
              <div style={{ display: "flex", gap: "5px" }}>
                <input 
                  type="text" 
                  placeholder="Paste published CSV link..." 
                  value={sheetUrl} 
                  onChange={(e) => setSheetUrl(e.target.value)} 
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "12px" }}
                />
                <button onClick={fetchGoogleSheet} disabled={isLoading} style={{ backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "6px", padding: "0 15px", cursor: "pointer" }}>
                  {isLoading ? "..." : "Fetch"}
                </button>
              </div>
              <p style={{ fontSize: "11px", color: "#9ca3af", marginTop: "4px" }}>*Sheet must be published to the web as CSV.</p>
            </div>

            <h3 style={{ marginTop: "30px", color: "#1f2937", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>Chart Configuration</h3>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "bold", marginBottom: "5px", color: "#4b5563" }}>Chart Title</label>
              <input type="text" value={chartTitle} onChange={(e) => setChartTitle(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }} />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "bold", marginBottom: "5px", color: "#4b5563" }}>Chart Type</label>
              <select value={chartType} onChange={(e) => setChartType(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }}>
                <option value="column">Column (Vertical)</option>
                <option value="bar">Bar (Horizontal)</option>
                <option value="line">Line</option>
                <option value="spline">Smooth Line (Spline)</option>
                <option value="area">Area</option>
                <option value="pie">Pie</option>
                <option value="doughnut">Doughnut</option>
                <option value="scatter">Scatter Plot</option>
              </select>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "bold", marginBottom: "5px", color: "#4b5563" }}>Color Palette</label>
              <select value={theme} onChange={(e) => setTheme(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }}>
                <option value="matificDefault">Matific Brand (Multi-color)</option>
                <option value="matificBlues">Corporate Blues</option>
                <option value="executiveDark">Executive Dark/Grey</option>
              </select>
            </div>

            {columns.length > 0 && (
              <div style={{ backgroundColor: "#eff6ff", padding: "15px", borderRadius: "8px", border: "1px solid #bfdbfe" }}>
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "bold", marginBottom: "5px", color: "#1e3a8a" }}>Data: X Axis (Categories)</label>
                  <select value={xAxisCol} onChange={(e) => setXAxisCol(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "4px" }}>
                    {columns.map(col => <option key={col} value={col}>{col}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "bold", marginBottom: "5px", color: "#1e3a8a" }}>Data: Y Axis (Values)</label>
                  <select value={yAxisCol} onChange={(e) => setYAxisCol(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "4px" }}>
                    {columns.map(col => <option key={col} value={col}>{col}</option>)}
                  </select>
                </div>
              </div>
            )}
          </div>

          <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column" }}>
            {dataTable.length > 0 ? (
              <div style={{ flex: 1, position: "relative" }}>
                <HighchartsReact highcharts={Highcharts} options={chartOptions} />
              </div>
            ) : (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#9ca3af", border: "2px dashed #d1d5db", borderRadius: "8px" }}>
                <svg style={{ width: "64px", height: "64px", marginBottom: "15px", color: "#d1d5db" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h2 style={{ margin: "0 0 10px 0", color: "#6b7280" }}>No Data Loaded</h2>
                <p style={{ margin: 0 }}>Please upload an Excel/CSV file or paste a Google Sheets link to generate the executive chart.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
