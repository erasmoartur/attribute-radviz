var tsneComponent = function () {
    var config = {
        el: null,
		width: 650,
		height: 650,
        marginLeft: 0,
		marginTop: 20,
		dotSize: 3,
		dataSize: 0,
		useTooltip: true,
		epsilon: 10,
		perplexity: 30,
		dimensions: [],
		colors: [],
		tooltipFormatter: function(d) {
            return d;
        }
	};

	
	var events = d3.dispatch('panelEnter', 'panelLeave', 'dotEnter', 'dotLeave');

	var selquadX, selquadY, basequadX, basequadY;		//bounding box variables
	var selquadW, selquadH;
	var selectedSamples;
	var transX = 0;
	var transY = 0;
	var scaXY = 1;


	const centerx = d3.scaleLinear().range([config.width / 2 - config.height / 2 + config.marginLeft, config.width / 2 + config.height / 2 - config.marginTop])
		  centery = d3.scaleLinear().range([config.marginLeft, config.height - config.marginTop]);
		
	var R = [51,220,255,16,153,0,221,102,184,49,153,34,170,102,230,139,101,50,85,59];
	var G = [102,57,153,150,0,153,68,170,46,99,68,170,170,51,115,7,16,146,116,62];
	var B = [204,18,0,24,153,198,119,0,46,149,153,153,17,204,0,7,103,98,166,172];
	
	var root;
		
	var zoom = d3.zoom()
		.scaleExtent([1/5, 10])
		.filter(() => { return d3.event.ctrlKey;})
		.on("zoom", zoomed);
	
var render = function(rawData, firstrun){
		var data = [];
		
		for (var i=0; i<rawData.length; i++){
			data.push;
			data[i] = [];
			for (var j=0; j<config.dimensions.length; j++){
				
				data[i][j] = rawData[i][config.dimensions[j]];	
			}
		}
		
		if (d3.select(config.el)._groups[0][0].firstChild){			// if canvas already exists, overwrite
			d3.select(config.el)._groups[0][0].firstChild.remove();
			document.getElementById('tsne-tooltip').remove();
		}
		
		/*if (d3.select("svg#tsne")[0][0])							// If SVG already exists then just select it
		d3.select("svg#tsne").remove();*/
		
		var svg = d3.select(config.el).append("svg")
			.attr("width", config.width)
			.attr("height", config.height)
			.attr("id","tsne")
		    .call(zoom);
			
		var drag = d3.drag()
			.on("drag", dragMove)
			.on("end", dragEnd)
			.on("start", dragStart)
			.filter(() => { return !d3.event.ctrlKey;});
		
		function dragMove(d,i){
			var x = (d3.event.x - transX)*1/scaXY;
			var y = (d3.event.y - transY)*1/scaXY;
			
			//handling the bounding  box
			if (x > selquadX)
				selquadW = x - selquadX;
			else
				selquadW = selquadX - x;
		
			if (y > selquadY)
				selquadH = y - selquadY;
			else
				selquadH = selquadY - y;
			
			// storing the base position of the bounding box
			basequadX = x<selquadX?x:(x-selquadW);
			basequadY = y>selquadY?(y-selquadH):y
			
			d3.selectAll(".quad_tsne")
				.attr("x", basequadX)
				.attr("y", basequadY)
				.attr("width", selquadW)
				.attr("height",selquadH);
		};
		
		function dragStart(d, i){
			var x = (d3.event.x - transX)*1/scaXY;
			var y = (d3.event.y - transY)*1/scaXY;
			selquadX = x;
			selquadY = y;		
		}
		
		function dragEnd(d, i) {
			var x = (d3.event.x - transX)*1/scaXY;
			var y = (d3.event.y - transY)*1/scaXY;
			d3.selectAll(".quad_tsne")		//hidding the bounding box
				.attr("x",0)
				.attr("y",0)
				.attr("width", 0)
				.attr("height",0);
			
			selectedSamples = [];
			d3.selectAll(".dots")
				.filter(function(dn,i) {
					if (dn.x > basequadX && dn.x < basequadX+selquadW && dn.y > basequadY && dn.y < basequadY+selquadH)
						selectedSamples.push(i);
							return dn.x > basequadX && dn.x < basequadX+selquadW && dn.y > basequadY && dn.y < basequadY+selquadH})
				.attr('stroke-width',1.5);				
				//update the visualization
			queryTheseSamples(selectedSamples);
		}
	
		
		root = svg.append('g')
           .attr("transform", "translate(" + config.marginLeft + "," + config.marginTop + ")");
		   
		var gTitle = svg.selectAll('.title')
			.data(['Vazio'])
			.enter().append('text')
			.classed('inf', true)
			.attr('x', config.marginLeft + config.width/2)
			.attr('y', '15%')
			.attr('font-size', 25)
			.attr('text-anchor','middle')
			.style('fill','rgb(180,190,192)')
			.text('Data View (t-SNE)');
			
					
		var selectQuad = root.append('rect')		// the bounding box
			.attr("x",50)
			.attr("y",50)
			.attr("width", 0)
			.attr("height",0)
			.classed('quad_tsne', true)
			.attr("fill-opacity", 0.25)
			.style("fill", 'red')
			.attr("stroke","rgb(0, 0, 0)")
			.style("stroke-width", 0.25);
			
		var dataSizeText = svg.selectAll('.title')
			.data(['Vazio'])
			.enter().append('text')
			.classed('inf', true)
			//.attr('text-anchor','middle')
			.attr('x', config.marginLeft + config.width/2)
			.attr('y', '90%')
			.attr('font-size', 18)
			.attr('text-anchor','middle')
			.style('fill','rgb(180,190,192)')
			.text(data.length+'/'+config.dataSize+' instances');
			
			
		const model = new tsnejs.tSNE({
			epsilon:config.epsilon,
            dim: data[0].length,
            perplexity: config.perplexity,
        });
		
		
		// initialize data with pairwise distances
        //const dists = data.map(d => data.map(e => d3.geoDistance(d, e)));
       
	   // model.initDataDist(dists);
	    model.initDataRaw(data);
	
		/*for(var k = 0; k < 500; k++) {
			model.step(); // every time you call this, solution gets better
		}*/
		
		
		const forcetsne = d3.forceSimulation(
          data.map(d => (d.x = (config.width/2*0.8), d.y = (config.height/2*0.8), d))
        )
            .alphaDecay(0.044)
            .alpha(0.1)
            .force('tsne', function (alpha) {
                // every time you call this, solution gets better
                model.step();

                // Y is an array of 2-D points that you can plot
                let pos = model.getSolution();

                centerx.domain(d3.extent(pos.map(d => d[0])));
                centery.domain(d3.extent(pos.map(d => d[1])));

                data.forEach((d, i) => {
                    d.x += alpha * (centerx(pos[i][0]) - d.x);
                    d.y += alpha * (centery(pos[i][1]) - d.y);
                });
            })
            .force('collide', d3.forceCollide().radius(config.dotSize));
            
		
		var background = root.append('rect')
			.attrs({ x: 0, y: 0, width: config.width, height: config.height, fill: 'red' })
			.attr('fill-opacity', 0)
			//.attr("visibility", "hidden")
			.call(drag);
		
		var nodes = root.selectAll('circle.dots')
            .data(data)
            .enter().append('circle')
            .classed('dots', true)
			.attr('fill-opacity', 1)
            .attr('r', config.dotSize)
			.style("fill", function(d,i){return 'rgb('+R[config.colors[i]]+','+G[config.colors[i]]+','+B[config.colors[i]]+')';})
            .on('mouseenter', function(d,i) {
                if(config.useTooltip) {
                    var mouse = d3.mouse(config.el);
                    tooltip.setText(rawData[i].Name).setPosition(mouse[0]+15, mouse[1]-15).show();
                }
 
            })
            .on('mouseout', function(d) {
                if(config.useTooltip) {
                    tooltip.hide();
                } 
            });
			
		
		var tooltipContainer = d3.select(config.el)
            .append('div')
            .attrs({
                id: 'tsne-tooltip'
            });
			
        var tooltip = tooltipComponent(tooltipContainer.node());
		
		forcetsne.on('tick', function () {
				nodes.attrs({
					cx: function(d) {
						return d.x;
					},
					cy: function(d) {
						return d.y;
					}
				});

            });
			
		return this;
	};
	
	var setConfig = function(_config) {
        config = utils.mergeAll(config, _config);
        return this;
    };
	
	function deleteALL(){
			var svg = d3.select("svg#graph");
			svg.selectAll("*").remove();
	};
	
	function resizeElements(){
			d3.selectAll('.dots').attr("r", function(d){return config.dotSize;});			
	};
	
	
	function zoomed() {
		root.attr('transform', 'translate(' + d3.event.transform.x + ',' + d3.event.transform.y + ') scale(' + d3.event.transform.k + ')');
		transX = d3.event.transform.x;
		transY = d3.event.transform.y;
		scaXY = d3.event.transform.k;
	}
	
	 var exports = {
        config: setConfig,
        render: render,
		deleteALL: deleteALL,
		resizeElements: resizeElements,
    };

   // d3.rebind(exports, events, 'on');
	return exports;

};