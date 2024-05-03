import * as d3 from "d3";
import "./viz.css";

////////////////////////////////////////////////////////////////////
////////////////////////////  Init  ///////////////////////////////

// svg
const svg = d3.select("#svg-container").append("svg").attr("id", "svg");
let width = parseInt(d3.select("#svg-container").style("width"));
let height = parseInt(d3.select("#svg-container").style("height"));
let margin = { top: 70, right: 10, bottom: 50, left: 10 };

// group 방사형 데이터 전체를 g로 그룹화해서 0,0을 svg의 중앙으로 옮기는 작업
const g = svg
  .append("g")
  .attr("transform", `translate(${width / 2 + 50}, ${height / 2})`);

// scale
let minLen = d3.min([height / 2 - margin.top, width / 2 - margin.right]);
const radiusScale = d3.scaleLinear().domain([0, 100]).range([0, minLen]);

// -------여기까지는 됐음!---------

const attributes = [
  "Food_Quality",
  "Speed_of_Service",
  "Value_for_Money_Spent",
  "Healthy_Options",
  "Curb_Appeal",
  "Overall_Cleanliness",
  "Staff_Friendliness",
  "Atmosphere",
];
const angleScale = d3
  .scaleLinear()
  .domain([0, attributes.length])
  .range([0, 2 * Math.PI]);

const radius = [0, 20, 40, 60, 80, 100];

// line radial
const radarLine = d3
  .lineRadial()
  .curve(d3.curveCardinalClosed)
  .angle((d, i) => angleScale(i))
  .radius((d) => radiusScale(selectedBurger[d]));

// svg elements

////////////////////////////////////////////////////////////////////
////////////////////////////  Load CSV  ////////////////////////////
// data

let data = [];
let selectedBurger;

let radiusAxis, angleAxis, labels;
let path;

let burgers;
let selectedName = "Five Guys";

d3.json("data/best_burgers.json").then((raw_data) => {
  data = raw_data;

  burgers = [...new Set(data.map((d) => d.Brand))];
  // console.log(brands);
  selectedBurger = data.filter((d) => d.Brand == selectedName)[0];
  // console.log(selectedPlayer);

  const dropdown = document.getElementById("options");

  burgers.map((d) => {
    const option = document.createElement("option");
    option.value = d;
    // 실제로 option에 넣은 값은 d(data), 위에서 d를 Brand로? 정의함
    option.innerHTML = d;
    // innerHTML은 보이는 텍스트
    option.selected = d === selectedName ? true : false;
    dropdown.appendChild(option);
  });

  dropdown.addEventListener("change", function () {
    selectedName = dropdown.value;
    updateBrand();
    // console.log(selectedName);
  });

  // axis
  radiusAxis = g
    .selectAll("radius-axis")
    .data(radius)
    .enter()
    .append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", (d) => radiusScale(d))
    .attr("fill", "rgba(10,10,10,0.01)")
    .attr("stroke", "#c3c3c3")
    .attr("stroke-width", 0.8);

  angleAxis = g
    .selectAll("angle-axis")
    .data(attributes)
    .enter()
    .append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", (d, i) => getXpos(100, i))
    .attr("y2", (d, i) => getYpos(100, i))
    .attr("stroke", "#ccc")
    .attr("stroke-width", 1);

  labels = g
    .selectAll("label")
    .data(attributes)
    .enter()
    .append("text")
    .attr("x", (d, i) => getXpos(116, i))
    .attr("y", (d, i) => getYpos(116, i))
    .text((d) => d)
    .attr("class", "labels");

  path = g
    .append("path")
    .datum(attributes)
    .attr("d", radarLine)
    // .attr("fill", "rgba(255,0,0,0.1)")
    .attr("fill", "#FFFF00")
    .attr("stroke", "#FF0000")
    .attr("stroke-width", 1.3)
    .style("fill-opacity", 0.3);

  d3.select("#burger-brand").text(selectedBurger.brand);
});

// function
const getXpos = (dist, index) => {
  //radius * cos (theta)
  return radiusScale(dist) * Math.cos(angleScale(index) - Math.PI / 2);
};

const getYpos = (dist, index) => {
  //radius * sin (theta)
  return radiusScale(dist) * Math.sin(angleScale(index) - Math.PI / 2);
};

// Update
// 애니메이션 넣기 첫 단계!
const updateBrand = () => {
  selectedBurger = data.filter((d) => d.Brand == selectedName)[0];

  radarLine.radius((d) => radiusScale(selectedBurger[d]));

  path.transition().duration(600).attr("d", radarLine);

  d3.select("#burger-brand").text(selectedBurger.Brand);
};

// Resize
window.addEventListener("resize", () => {
  width = parseInt(d3.select("#svg-container").style("width"));
  height = parseInt(d3.select("#svg-container").style("height"));

  g.attr("transform", `translate(${width / 2}, ${height / 2})`);
  // --> svg는 resize가 되는데 그룹으로 묶어서 가운데 옮겨놓은 그 그룹은 resize 적용이 안 돼서 해주는 것

  minLen = d3.min([height / 2 - margin.top, width / 2 - margin.right]);
  radiusScale.range([0, minLen]);

  // axis update
  radiusAxis.attr("r", (d) => radiusScale(d));

  angleAxis
    .attr("x2", (d, i) => getXpos(100, i))
    .attr("y2", (d, i) => getYpos(100, i));

  // path update
  radarLine.radius((d) => radiusScale(selectedBurger[d]));

  path.attr("d", radarLine);

  // label update
  labels
    .attr("x", (d, i) => getXpos(116, i))
    .attr("y", (d, i) => getYpos(116, i));
});
