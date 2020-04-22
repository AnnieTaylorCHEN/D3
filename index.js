//The Rectangular

// const data = [
//   { width: 200, height: 100, fill: 'purple' },
//   { width: 100, height: 60, fill: 'pink' },
//   { width: 50, height: 30, fill: 'red' },
// ]

// const svg = d3.select('svg')

// //add data and add attrs to the rects already in the DOM
// const rects = svg
//   .selectAll('rect')
//   .data(data)
//   .attr('width', (d) => d.width)
//   .attr('height', (d) => d.height)
//   .attr('fill', (d) => d.fill)

//   //append the enter selection to the DOM
// rects
//   .enter()
//   .append('rect')
//   .attr('width', (d) => d.width)
//   .attr('height', (d) => d.height)
//   .attr('fill', (d) => d.fill)

//The planets
// const svg = d3.select('svg')

// d3.json('planets.json').then((data) => {
//   const circs = svg.selectAll('circle').data(data)

//   circs
//     .attr('cy', 200)
//     .attr('cx', (d) => d.distance)
//     .attr('r', (d) => d.radius)
//     .attr('fill', (d) => d.fill)

//   circs
//     .enter()
//     .append('circle')
//     .attr('cy', 200)
//     .attr('cx', (d) => d.distance)
//     .attr('r', (d) => d.radius)
//     .attr('fill', (d) => d.fill)
// })

//The Veg Menu Bar Chart
const svg = d3
  .select('.canvas')
  .append('svg')
  .attr('width', 600)
  .attr('height', 600)

const margin = { top: 20, bottom: 50, left: 100, right: 100 }
const graphWidth = 600 - margin.left - margin.right
const graphHeight = 600 - margin.top - margin.bottom

const graph = svg
  .append('g')
  .attr('width', graphWidth)
  .attr('height', graphHeight)
  .attr('transform', `translate(${margin.left}, ${margin.top})`)

const xAxisGroup = graph
  .append('g')
  .attr('transform', `translate(0, ${graphHeight})`)
const yAxisGroup = graph.append('g')

xAxisGroup
  .selectAll('text')
  .attr('transform', 'rotate(-40)')
  .attr('text-anchor', 'end')
  .attr('fill', 'darkgreen')

//scales: to keep the height in proportion
const y = d3.scaleLinear().range([graphHeight, 0])

const x = d3.scaleBand().range([0, 500]).paddingInner(0.2).paddingOuter(0.2)

const xAxis = d3.axisBottom(x)
const yAxis = d3
  .axisLeft(y)
  .ticks(3)
  .tickFormat((d) => d + ' orders')

// update function
const update = (data) => {
  y.domain([0, d3.max(data, (d) => d.orders)])
  x.domain(data.map((item) => item.name))

  //join the data to rects
  const rects = graph.selectAll('rect').data(data)

  //remove exit selection when no longer needing them
  rects.exit().remove()

  //update the current shapes in the DOM
  rects
    .attr('width', x.bandwidth)
    .attr('height', (d) => graphHeight - y(d.orders))
    .attr('fill', 'darkgreen')
    .attr('x', (d) => x(d.name))
    .attr('y', (d) => y(d.orders))

  //append the enter selection to the DOM
  rects
    .enter()
    .append('rect')
    .attr('width', x.bandwidth)
    .attr('height', (d) => graphHeight - y(d.orders))
    .attr('fill', 'darkgreen')
    .attr('x', (d) => x(d.name))
    .attr('y', (d) => y(d.orders))

  //call axes
  xAxisGroup.call(xAxis)
  yAxisGroup.call(yAxis)
}

//get data from firestore

// db.collection('dishes')
//   .get()
//   .then((res) => {
//     let data = []
//     res.docs.forEach((doc) => {
//       data.push(doc.data())
//     })
//     update(data)
// })

let data = []

db.collection('dishes').onSnapshot((res) => {
  res.docChanges().forEach((change) => {
    const doc = { ...change.doc.data(), id: change.doc.id }

    switch (change.type) {
      case 'added':
        data.push(doc)
        break
      case 'modified':
        const index = data.findIndex((item) => item.id === doc.id)
        data[index] = doc
        break
      case 'removed':
        data = data.filter((item) => item.id !== doc.id)
        break
      default:
        break
    }
  })
  update(data)
})
