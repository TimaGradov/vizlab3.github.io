const b_width = 1000;
const d_width = 500;
const b_height = 1000;
const d_height = 1000;
const colors = [
    '#DB202C','#a6cee3','#1f78b4',
    '#33a02c','#fb9a99','#b2df8a',
    '#fdbf6f','#ff7f00','#cab2d6',
    '#6a3d9a','#ffff99','#b15928'];

const radius = d3.scaleLinear().range([.5, 20]);
const color = d3.scaleOrdinal().range(colors);
const x = d3.scaleLinear().range([0, b_width]);

const bubble = d3.select('.bubble-chart')
    .attr('width', b_width).attr('height', b_height);
const donut = d3.select('.donut-chart')
    .attr('width', d_width).attr('height', d_height)
    .append("g")
    .attr("transform", "translate(" + d_width / 2 + "," + d_height / 2 + ")");

const donut_lable = d3.select('.donut-chart').append('text')
    .attr('class', 'donut-lable')
    .attr("text-anchor", "middle")
    .attr('transform', `translate(${(d_width/2)} ${d_height/2})`);
const tooltip = d3.select('.tooltip');
//  Part 1 - Create simulation with forceCenter(), forceX() and forceCollide()
const simulation = d3.forceSimulation()
    .force('center', d3.forceCenter(b_width / 2, b_height / 2))
    .force('charge', d3.forceManyBody())
    .force('x', d3.forceX().strength(0.5).x(function(d) {
        return x(+d['release year']);
    })).force('y', d3.forceY().y(function(d) {
        return 500;
    }))
    .force('collide', d3.forceCollide().radius(function(d) {
        return radius(+d['user rating score']);
    }));

//simulation.force('center')
// ..

d3.csv('data/netflix.csv').then(data=>{
    data = d3.nest().key(d=>d.title).rollup(d=>d[0]).entries(data).map(d=>d.value).filter(d=>d['user rating score']!=='NA');

    const rating = data.map(d=>+d['user rating score']);
    const years = data.map(d=>+d['release year']);
    let ratings = d3.nest().key(d=>d.rating).rollup(d=>d.length).entries(data);



    // Part 1 - add domain to color, radius and x scales
    // ..
    color.domain(ratings);
    radius.domain([d3.min(rating), d3.max(rating)]);
    x.domain([d3.min(years), d3.max(years)]);


    // Part 1 - create circles

    var nodes = bubble
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return x(+d['release year']) })
        .attr("r", function (d) { return radius(+d['user rating score']) })
        .style("fill", function (d) {
            return color(d['rating'])
        })
        .style("stroke", "none")
        .style('storke-width', 4)
        .on('mouseover', overBubble)
        .on('mouseout', outOfBubble);

    tooltip
        .style('opacity', 0)
        .attr('class', 'tooltip')
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px");


    // ..
    // mouseover and mouseout event listeners
    // .on('mouseover', overBubble)
    // .on('mouseout', outOfBubble);

    // Part 1 - add data to simulation and add tick event listener
    // ..

    simulation.nodes(data)
        .on("tick", ticked);

    function ticked() {
        var u = bubble
            .selectAll('circle')
            .data(data);

            u.enter()
                .append('circle')
                .style('fill', function(d) {
                    return color(d['rating']);
                })
                .attr('r', function(d) {
                    return radius(+d['user rating score']);
                 })
                .merge(u)
                .attr('cx', function(d) {
                    return d.x;
                })
                .attr('cy', function(d) {
                    return d.y;
                });
            u.exit().remove()
    }


    // Part 1 - create layout with d3.pie() based on rating
    // ..

    var pieGenerator = d3.pie()
        .value(function(d){
            return d.value;
        });
    var arcData = pieGenerator(ratings);

    var arcGenerator = d3.arc()
        .innerRadius(130)
        .outerRadius(200);

    donut.selectAll('path')
        .data(arcData)
        .enter()
        .append('path')
        .style("fill", function(d){
            return color(d.data.key);
        })
        .attr('d', arcGenerator)
        .on('mouseover', overArc)
        .on('mouseout', outOfArc);


    // Part 1 - create an d3.arc() generator
    // ..

    // Part 1 - draw a donut chart inside donut
    // ..

    // mouseover and mouseout event listeners
    //.on('mouseover', overArc)
    //.on('mouseout', outOfArc);

    function overBubble(d){
        // Part 2 - add stroke and stroke-width
        // ..
        d3.select(this)
            .style("stroke", "black");

        // Part 3 - updata tooltip content with title and year
        // ..
        tooltip.transition().duration(100).style('opacity', 1);
        tooltip.html(d.title + "<br/>" + "<span style='opacity: 0.5' >" + d['release year'])
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 60) + "px");
        // .style("left", (d3.event.pageX) + "px")
            // .style("top", (d3.event.pageY - 28) + "px");
        // Part 3 - change visibility and position of tooltip
        // ..
    }
    function outOfBubble(){
        d3.select(this)
            .style("stroke", "none");
        // Part 2 - remove stroke and stroke-width
        // ..
        tooltip.transition().duration(300).style('opacity', 0)
        // Part 3 - change visibility of tooltip
        // ..
    }

    function overArc(d){
        d3.select(this).style('opacity',0.5);
        // Part 2 - change donut_lable content
        // ..
        // Part 2 - change opacity of an arc
        // ..
        donut_lable.text(d.data.key)
        // Part 3 - change opacity, stroke и stroke-width of circles based on rating
        nodes
            .style('opacity', function (buble_d) {
                return buble_d.rating === d.data.key ? 1 : 0.3;
            })
            .style('stroke', function (buble_d) {
                return buble_d.rating === d.data.key ? "black" : "none";
            })
        // ..
    }
    function outOfArc(){
        d3.select(this).style('opacity', 1)

        // Part 2 - change content of donut_lable
        // ..
        // Part 2 - change opacity of an arc
        // ..
        nodes
            .style('opacity', 1)
            .style('stroke', "none")
        // Part 3 - revert opacity, stroke and stroke-width of circles
        // ..
    }
});