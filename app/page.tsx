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
  const [chartTitle, setChartTitle] = useState("My Professional Chart");
  const [dataTable, setDataTable] = useState([]);
  const [columns, setColumns] = useState([]);
  const [xAxisCol, setXAxisCol] = useState("");
  const [yAxisCol, setYAxisCol] = useState("");
  const [chartOptions, 
