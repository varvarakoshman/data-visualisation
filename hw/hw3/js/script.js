const b_width = 1000;
const d_width = 500;
const b_height = 1000;
const d_height = 1000;
const colors = [
    '#DB202C','#a6cee3','#1f78b4',
    '#33a02c','#fb9a99','#b2df8a',
    '#fdbf6f','#ff7f00','#cab2d6',
    '#6a3d9a','#ffff99','#b15928']
const user_rating_score = 'user rating score';
const release_year = 'release year';
const color_column = 'rating';

// Part 1: Создать шкалы для цвета, радиуса и позиции 
const radius = d3.scaleLinear().range([.5, 20]);
const color = d3.scaleOrdinal().range(colors);
const x = d3.scaleLinear().range([0, b_width]);

const bubble = d3.select('.bubble-chart')
    .attr('width', b_width)
    .attr('height', b_height);
const donut = d3.select('.donut-chart')
    .attr('width', d_width)
    .attr('height', d_height)
    .append("g")
        .attr('transform', "translate(" + d_width / 2 + "," + d_height / 2 + ")");

const donut_lable = d3.select('.donut-chart').append('text')
        .attr('class', 'donut-lable')
        .attr('text-anchor', 'middle')
        .attr('transform', `translate(${(d_width/2)} ${d_height/2})`);

const tooltip = d3.select('.tooltip')

//  Part 1 - Создать симуляцию с использованием forceCenter(), forceX() и forceCollide()
const simulation = d3.forceSimulation()
                    .force('center', d3.forceCenter(b_width/2, b_height/2))
simulation.stop();

d3.csv('data/netflix.csv').then(data=>{
    data = d3.nest()
            .key(d=>d.title)
            .rollup(d=>d[0])
            .entries(data)
            .map(d=>d.value)
            .filter(d=>d[user_rating_score]!=='NA');
    console.log(data)
    
    // Part 1 - задать domain  для шкал цвета, радиуса и положения по x
    let radiusMap = d => +d[user_rating_score];
    let xMap = d => +d[release_year];
    let colorMap = d => d[color_column];
    let radiusRange = data.map(radiusMap);
    radius.domain([d3.min(radiusRange), d3.max(radiusRange)]);
    let ratings = d3.nest()
                    .key(d=>d.rating)
                    .rollup(d=>d.length)
                    .entries(data);
    color.domain([d3.min(ratings), d3.max(ratings)]);
    let xRange = data.map(xMap);
    x.domain([d3.min(xRange), d3.max(xRange)]);

    // Part 1 - создать circles на основе data
    var nodes = bubble.selectAll("circle")
        .data(data)
        .enter()
        .append('circle')
        .attr('r', d => radius(radiusMap(d)))
        .attr('cx', d => x(xMap(d)))
        .style('fill', d => color(colorMap(d)))
        .on('mouseover', overBubble)     // добавляем обработчики событий mouseover и mouseout
        .on('mouseout', outOfBubble);
    
    // Part 1 - передать данные в симуляцию и добавить обработчик события tick
    simulation.force('collision', d3.forceCollide().radius(d => radius(radiusMap(d))))
            .force('x', d3.forceX(d => x(xMap(d))));
    simulation.nodes(data);
    simulation.on('tick', d =>
        nodes.attr('cx', d => d.x)
            .attr('cy', d => d.y))
    .restart();

    // Part 1 - Создать шаблон при помощи d3.pie() на основе ratings
    var pie = d3.pie().value(d => d.value);
    // Part 1 - Создать генератор арок при помощи d3.arc()
    var arc = d3.arc()
                .innerRadius(120)
                .outerRadius(200)
                .padAngle(0.02)
                // .cornerRadius(20);
    // Part 1 - построить donut chart внутри donut
    donut.selectAll('path')
        .data(pie(ratings))
        .enter()
        .append('path')
        .attr('d', arc) 
        // .attr("stroke", "black")
        .attr('fill', d => color(d.data.key))
        .attr('opacity', 0.7)
        .on('mouseover', overArc)     // добавляем обработчики событий mouseover и mouseout
        .on('mouseout', outOfArc);

    function overBubble(d){
        // Part 2 - задать stroke и stroke-width для выделяемого элемента   
        d3.select(this).attr('stroke', 'black')
                    .attr('stroke-width', 3);
        // Part 3 - обновить содержимое tooltip с использованием классов title и year
        // Part 3 - изменить display и позицию tooltip
        tooltip.html("<element class=\"title\">"+ d.title + "<element class=\"title\">" + "<br>"
         + "<element class=\"year\">" + d[release_year] + "<element class=\"year\">")
                .style('display', 'block')
                .style("left", (d3.mouse(this)[0]+20) + "px")
                .style("top", (d3.mouse(this)[1]) + "px");
    }
    function outOfBubble(){
        // Part 2 - сбросить stroke и stroke-width
        d3.select(this).attr('stroke', null)
                    .attr('stroke-width', null);
        // Part 3 - изменить display у tooltip
        tooltip.style('display', 'none');
    }

    function overArc(d){
        let curr_rating = d.data.key;
        // Part 2 - изменить содержимое donut_lable
        donut_lable.text(curr_rating);
        // Part 2 - изменить opacity арки
        d3.select(this).attr('opacity', 0.4);
        // Part 3 - изменить opacity, stroke и stroke-width для circles в зависимости от rating
        bubble.selectAll('circle')
            .data(data)
            .style('stroke', d => d[color_column] == curr_rating ? 'black' : 'transparent')
            .style('stroke-width', d => d[color_column] == curr_rating ? 3 : null)
            .style('opacity', d => d[color_column] == curr_rating ? 1 : 0.5);
    }
    function outOfArc(){
        // Part 2 - изменить содержимое donut_lable
        donut_lable.text(null);
        // Part 2 - изменить opacity арки
        d3.select(this).attr('opacity', 0.7);
        // Part 3 - вернуть opacity, stroke и stroke-width для circles
        bubble.selectAll('circle')
            .data(data)
            .style('stroke', null)
            .style('stroke-width', null)
            .style('opacity', 1);
    }
});