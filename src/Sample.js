class Tree {

    constructor(_config, _data) {
      this.config = {
        parentElement: _config.parentElement,
        containerWidth: _config.containerWidth, 
        containerHeight: _config.containerHeight, 
        margin: _config.margin
      }
  
      this.data = _data;
      this.initVis();
    }
    
    initVis() {
      let vis = this;
      
      vis.colors = ["#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462", "#b3de69", "#fccde5", "#d9d9d9", "#bc80bd", "#ccebc5", "#ffed6f"];
  
      vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
      vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
  
      vis.svg = d3.select(vis.config.parentElement)
          .attr('width', vis.config.containerWidth)
          .attr('height', vis.config.containerHeight);
  
      vis.chart = vis.svg.append('g')
          //.attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`)
          .attr('width', vis.width)
          .attr('height', vis.height);
              
      vis.renderVis(vis.data); 
    }
    renderVis(data) {
      let vis = this;
      const characters= ['Korra', 'Lin', 'Tarrlok', 'Toph', 'Tenzin', 'Jinora', 'Iroh', 'Mako','Bolin', 'Asami', 'Suyin', 'Kuvira'];
      
      const characters_lines= [1493, 291, 101, 91, 620, 174, 58, 819, 721, 347, 163, 148];
      
      // Define the position of each character circle
      const maxLines = d3.max(characters_lines);

      const characterPositions = characters.map((d, i) => ({
        name: d,
        lines: characters_lines[i],
        x: 400 + ((Math.sqrt(maxLines) * 2) -  300* Math.cos(2 * Math.PI * i / characters.length)),
        y: 300 + ((Math.sqrt(maxLines) * 2) - 300 * Math.sin(2 * Math.PI * i / characters.length))
      }));
      
      // Append circles for each character
      const group = vis.chart.selectAll('.group')
        .data(characterPositions)
        .enter().append('g')
        .attr('class', 'group');
    
      group.append('circle')
        .attr('class', 'circle')
        .attr('r', d => Math.sqrt(d.lines) * 2)
        .attr('fill', (d, i) => vis.colors[i % vis.colors.length])
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);
        
      group.append('text')
        .attr('class', 'label')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-weight', 'bold')
        .text(d => d.name)
        .attr('x', d => d.x)
        .attr('y', d => d.y);

      // Define the connections between characters
      const connections = [
        { source: 'Korra', target1: 'Tenzin' , target2: 'Tarrlok', target3:'Lin'},
        { source: 'Lin', target1: 'Jinora', target2: 'Tarrlok', target3:'Suyin' },
        { source: 'Tarrlok', target1: 'Toph', target2: 'Korra', target3:'Lin' },
        { source: 'Toph', target1: 'Bolin', target2: 'Tarrlok', target3:'Lin' },
        { source: 'Jinora', target1: 'Mako', target2: 'Tarrlok', target3:'Lin' },
        { source: 'Iroh', target1: 'Mako', target2: 'Tarrlok', target3:'Lin' },
        { source: 'Mako', target1: 'Bolin', target2: 'Tarrlok', target3:'Lin' },
        { source: 'Bolin', target1: 'Tenzin' , target2: 'Tarrlok', target3:'Lin'},
        { source: 'Asami', target1: 'Jinora', target2: 'Tarrlok', target3:'Bolin' },
        { source: 'Suyin', target1: 'Asami', target2: 'Tarrlok', target3:'Lin' },
        { source: 'Kuvira', target1: 'Bolin', target2: 'Tarrlok', target3:'Lin' }];
      
       const lineGenerator = d3.line()
        .x(d => d.x) // maps the x-coordinate of the point to the "x" attribute in the path string
        .y(d => d.y); // maps the y-coordinate of the point to the "y" attribute in the path string
      
        // Create the paths between circles
      
       const connectionData = connections.map(d => {
          const sourceCircle = characterPositions.find(c => c.name === d.source);
          const targetCircles = [d.target1, d.target2, d.target3]
            .map(target => characterPositions.find(c => c.name === target))
            .filter(target => target); // filters out any undefined targets
          
          return {
            source: {x: sourceCircle.x, y: sourceCircle.y},
            targets: targetCircles.map(target => ({x: target.x, y: target.y}))
          };
      });

      const connectionPaths = vis.chart.selectAll('.connection')
        .data(connectionData)
        .join('path')
        .attr('class', 'connection')
        .attr('d', d => lineGenerator([d.source, ...d.targets]))
        .attr('fill','none')
        .attr('stroke', 'black')
        .attr('stroke-width',2);
      
      let episode = [];
      for (let i = 0; i < vis.data.length; i++) {
          episode.push(vis.data[i].transcript);
      }

      vis.all_text =''
      for (let i = 0; i < vis.data.length; i++) {
          let transcript= episode[i];
          transcript.forEach(text => { 
              if(text.text == "Korra")
              {
                console.log(text.speaker); 
              }
        });
      }
    }
    updateVis(data) {
        
    }
 }


