var radvizRegular = function () {
    var config = {
        el: null,
		colorMode: true,
        size: 550,
        margin: 90,
		marginTop: 130,
		marginLeft: 110,
		arcwidth1: 4.5,
		arcwidth2: 12,
		arcwidth3: 4.5,
		arclenght: 0.52,
        arcMinSize: 0.02,
		arcRefMinSize: 0,
        arcDistance: -2,
        arcDistance2: 4.5,
        arcDistance3: 10.5,
		infoPanelSize: 110,
		infoPanelLeft: -180,
		infoPanelTop:-30,
		infoPanelWidth: 150,
		infoPanelSub: 310,
		panelYPos: 80,
		infoPanelItemHeight: 12,
		dotSize: 5,
		dotMinSize: 1,
		mainCicleStroke: 1.5,
        colorAccessor: null,
        dimensions: [],
		allDimensions: [],
        dbBalance: [],
        angleTable: [],
		colors: [],
		labelSet: [],
        drawLinks: false,
        zoomFactor: 1,
		chartRadius: 185,
        dotRadius: 5,
        dimDotRadius: 3,
		collideRadius: 2.5,
		collideRatio: 1,
        useRepulsion: false,
        useTooltip: true,
		alphaVec: 1.5,
		elemOpacity: 0.75,
		dataSize: 0,
        tooltipFormatter: function(d) {
            return d;
        }
    };
	
	

	var Class = 'elemSize';
	var selectedClass,selectedSamples;

    var events = d3.dispatch('panelEnter', 'panelLeave', 'dotEnter', 'dotLeave');
    
    var force;
	
	var selquadX, selquadY, basequadX, basequadY;		//bounding box variables
	var selquadW, selquadH;
	
	//storing links data
    var linksData = [];
		
		
    var render = function(data, firstrun) {
        data = addNormalizedValues(data);
        var normalizeSuffix = '_normalized';
        var dimensionNamesNormalized = config.dimensions.map(function(d) {
            return d + normalizeSuffix;
        });
        
    var thetaScale = d3.scaleLinear()
        .domain([0, dimensionNamesNormalized.length])
        .range([0, Math.PI * 2]);


        var chartRadius = config.size / 2 - config.margin;
		config.chartRadius = chartRadius;
        var nodeCount = data.length;
        var panelSize = config.size - config.margin * 2;
		
		// Generated in "i want hue" site
		var R = [121,163,92,207,143,94,196,197,61,223,92,206,63,225,94,218,142,107,228,54,173,172,199,83,227,162,159,217,164,137];
		var G = [157,91,196,76,178,108,181,144,144,54,191,62,193,109,149,146,82,116,117,129,57,189,74,108,134,147,79,162,87,105];
		var B = [82,205,84,168,53,204,57,213,55,102,137,41,191,56,207,48,140,27,162,91,104,118,74,43,127,66,87,106,43,42];
		
		
		// Google 20c color scale
		if (config.labelSet.length < 20){
		var R = [51,220,255,16,153,0,221,102,184,49,153,34,170,102,230,139,101,50,85,59];
		var G = [102,57,153,150,0,153,68,170,46,99,68,170,170,51,115,7,16,146,116,62];
		var B = [204,18,0,24,153,198,119,0,46,149,153,153,17,204,0,7,103,98,166,172];
		}
		
		// If there are few labels fill up with google 10c color scale
	/*	if (config.labelSet.length < 10){
			R = [51,220,255,16,153,0,221,102,184,49];
			G = [102,57,153,150,0,153,68,170,46,99];
			B = [204,18,0,24,153,198,119,0,46,149];
		}*/
		
        var dimensionsColors = [];
		var currentElm;
		
		R.forEach(function(dB, iB){
			dimensionsColors.push({
				dcolor:'rgb('+R[iB]+','+G[iB]+','+B[iB]+')'
			});
		});
       
        
        //Calcs the dimensions nodes posicions
        var dimensionNodes = dimensionNamesNormalized.map(function(d, i) {
            if (i>config.angleTable.length-1)
                config.angleTable[i] = thetaScale(i);
            var x = chartRadius + Math.cos(config.angleTable[i]) * chartRadius * config.zoomFactor;
            var y = chartRadius + Math.sin(config.angleTable[i]) * chartRadius * config.zoomFactor;
            return {
                index: nodeCount + i,
                x: x,
                y: y,
                fx: x,
				fy: y,
                name: d
            };
        });
        
        
        
        config.firstrun = false;
        //Max correlation value
        var maxValue = 0;

		//computing links data
		linksData = [];
		data.forEach(function(d, i) {
            dimensionNamesNormalized.forEach(function(dB, iB){
                linksData.push({
                    source: i,
                    target: nodeCount + iB,
					alpha: d[dB],
					color: dimensionsColors[iB],
                    value: d[dB]
                });
                if (maxValue<d[dB]) maxValue = d[dB];
            });
        });
        
       // Ratio for ARC        
        var arcRatio = d3.scaleLinear()
            .domain([0,d3.max(config.dbBalance)])
            .range([0,Math.PI/dimensionNamesNormalized.length/2]);
        
        var arcRatio2 = d3.scaleLinear()
            .domain([0,maxValue])
            .range([0,Math.PI/dimensionNamesNormalized.length/2]);


        var arcColor = d3.scaleLinear()
            .domain([0,maxValue])
            .range(["#ff4d4d", "#00cc00"]);
						
        force = d3.forceSimulation(data.concat(dimensionNodes))
				//.alphaTarget(0.01)
				//.force('center_force',d3.forceCenter(config.chartRadius, config.chartRadius))
				.force('x_force', d3.forceX(config.chartRadius).strength(0.1))
				.force('y_force', d3.forceY(config.chartRadius).strength(0.1))	
				.alphaDecay(0.1)				
				.force("collide",d3.forceCollide( function(d){
					return (d.elemSize*config.dotSize+config.dotMinSize)*config.collideRatio;}).iterations(1))
				.force("link", d3.forceLink(linksData).strength( function(d) { 
					return d.alpha+0.01; }).distance(10).iterations(1));

		
		if (d3.select(config.el)._groups[0][0].firstChild){			// if canvas already exists, overwrite
			d3.select(config.el)._groups[0][0].firstChild.remove();
			document.getElementById('regradviz-tooltip').remove();
		}
		var _svg = d3.select(config.el)
				.append('svg')
				.attrs({
					width: config.size + config.infoPanelSize,
					height: config.size + 100
				})
				.attr("id","reg");

		var tooltipContainer = d3.select(config.el)
            .append('div')
            .attrs({
                id: 'regradviz-tooltip'
            });
        var tooltip = tooltipComponent(tooltipContainer.node());

        var root = _svg.append('g')
            .attrs({
                transform: 'translate(' + [config.margin+config.marginLeft, config.marginTop] + ')'
            });

        var panel = root.append('circle')
            .classed('panel_', true)
            .attrs({
                r: chartRadius,
                cx: chartRadius,
                cy: chartRadius,
            })
		//	.style('fill', 'rgb(245,245,245)')
			.style('fill', 'rgb(255,255,255)')
			.style('stroke-width',config.mainCicleStroke)
			.style("stroke","rgb(50,50,50)")
			.call(drag);
			
		var selectQuad = root.append('rect')		// the bounding box
			.attr("x",50)
			.attr("y",50)
			.attr("width", 0)
			.attr("height",0)
			.classed('quad_r', true)
			.attr("fill-opacity", 0.25)
			.style("fill", 'red')
			.attr("stroke","rgb(0, 0, 0)")
			.style("stroke-width", 0.25);

        if(config.useRepulsion) {
            root.on('mouseenter', function(d) {
               // force.chargeDistance(40).alpha(0.2);
                events.panelEnter();
            });
            root.on('mouseleave', function(d) {
                //force.chargeDistance(0).resume();
                events.panelLeave();
            });
        }

        // Links
        if (config.drawLinks) {
			var links = root.selectAll('.link_')
				.data(linksData)
				.enter().append('line')
				.attr("stroke","silver")
				.attr("stroke-opacity", 0.05)
				.classed('link_', true)
				.attr('pointer-events', 'none');		
        }
		
		// Graphic title
		var gTitle = root.selectAll('.title')
			.data(['Vazio'])
			.enter().append('text')
			.classed('inf', true)
			//.attr('text-anchor','middle')
			.attr('x', chartRadius)
			.attr('y', -35)
			.attr('font-size', 25)
			.attr('text-anchor','middle')
			.style('fill','rgb(180,190,192)')
			.text('Data View (RadViz)');
			
		// Data size
		var dataSizeText = root.selectAll('.title')
			.data(['Vazio'])
			.enter().append('text')
			.classed('inf', true)
			//.attr('text-anchor','middle')
			.attr('x', chartRadius)
			.attr('y', chartRadius*2 + 55)
			.attr('font-size', 18)
			.attr('text-anchor','middle')
			.style('fill','rgb(180,190,192)')
			.text(data.length+'/'+config.dataSize+' instances');
		
		// Text attribute
		var selected = root.selectAll('.title_')
			.data('Vazio')
			.enter().append('text')
			.classed('bar_', true)
			//.attr('text-anchor','middle')
			.attr('x', config.infoPanelLeft)
			.attr('y', config.infoPanelTop - 5)
			.attr("font-family", "sans-serif")
			.attr("fill","rgb(50,50,50)")
			.attr('font-size', 15)
			.text('');
			
		var textValues = root.selectAll('.title_')
			.data(dimensionNodes)
			.enter().append('text')
			.classed('bar_', true)
			.attr('x', config.infoPanelLeft + maxValue * config.infoPanelWidth)
			.attr('y', function(d,i) { return i*config.infoPanelItemHeight+config.infoPanelTop+11;})
			.attr('font-size', 10)
			.text(function (d,i){return '';});
		
		var textInfo = root.selectAll('.title_')
			.data(dimensionNodes)
			.enter().append('text')
			.classed('bar_', true)
			.attr("font-family", "sans-serif")
			.attr("fill", "rgb(50,50,50)")
			.style("font-weight","bold")
			.style('text-anchor','middle')
			.attr('x', config.infoPanelLeft + maxValue * config.infoPanelWidth/2)
			.attr('y', function(d,i) { return i*config.infoPanelItemHeight+config.infoPanelTop+8;})
			.attr('font-size', 10)
			.text(function (d,i){return d.name.replace("_normalized", "");});
			
		
		// Labels legend background	
		var subtitlesbars = root.selectAll('bar2')
			.data(labelSet)
			.enter().append('rect')
			.classed('bar2', true)
		//	.call(drag)
			.attr("rx", 3)
			.attr("ry", 3)
			.attr('x', config.infoPanelLeft)
			.attr('y', function(d,i) { return i*config.infoPanelItemHeight+config.infoPanelTop+config.infoPanelSub;})
			.attr('height', 10)
			.attr('width', maxValue*config.infoPanelWidth)
			.attr('fill-opacity', 0.7)
			.style('fill', function(d,i){return dimensionsColors[i].dcolor;})
			.on('mouseover', function(d) {
				if (selectedClass == null){
				d3.selectAll('circle.dot_')
					.transition()
					.duration(300)
					.attr('fill-opacity',0.1);
				d3.selectAll('circle.dot_')
					.filter(function(dn,i) {
						return labelSet.indexOf(d) == config.colors[i];})
					.transition()
					.duration(300)
					.attr('fill-opacity',1);
				}
			})
			.on('mouseout', function(d) {
			if (selectedClass == null){
				d3.selectAll('circle.dot_')
				.transition()
				.duration(300)
				.attr('fill-opacity', config.elemOpacity);
			}
            })
			.on('click', function(d) {
				//d3.selectAll('').classList.remove('active');
				if (selectedClass == d){   //deselecionar
					selectedClass = null;
					d3.selectAll('circle.dot_')
						.transition()
						.duration(300)
						.attr('fill-opacity', config.elemOpacity);	
					subtitlesbars.attr('stroke-opacity',0);
				}else{
					subtitlesbars.attr('stroke-opacity',0);
					subtitlesbars.attr('stroke-width',1)
					.filter(function(dn,i) {
						return dn == d;})
					.attr('stroke-opacity',1)
					.attr('stroke', 'rgb(0,0,0)');
					d3.selectAll('circle.dot_')
					.transition()
					.duration(300)
					.attr('fill-opacity',0.1);
					d3.selectAll('circle.dot_')
					.filter(function(dn,i) {
						return labelSet.indexOf(d) == config.colors[i];})
					.transition()
					.duration(300)
					.attr('fill-opacity',1);
					
					selectedClass = d;					
				}
				
				
				
				//this.classList.add('active');	
				//this.attr('stroke-width',1).attr('stroke', 'rgb(255,0,0)');
				//subtitlesbars.data(labelSet).attr('stroke-width',1).attr('stroke-opacity',1);
				
			});
			
		// Labels legend
		var textSubs = root.selectAll('.title_')
			.data(labelSet)
			.enter().append('text')
			.classed('bar2', true)
			.attr("font-family", "sans-serif")
			.attr("fill","rgb(50,50,50)")
			.style("font-weight","bold")
			.style('text-anchor','middle')	
			.attr('x', config.infoPanelLeft + maxValue * config.infoPanelWidth/2)
			.attr('y', function(d,i) { return i*config.infoPanelItemHeight+config.infoPanelTop+config.infoPanelSub+8;})
			.attr('font-size', 10)
			.text(function (d,i){return d;})
			.attr('pointer-events', 'none');
		

			
		var shadowbars = root.selectAll('bar_')
			.data(dimensionNodes)
			.enter().append('rect')
			.classed('bar_', true)
			.call(drag)
			.attr("rx", 3)
			.attr("ry", 3)
			.attr('x', config.infoPanelLeft)
			.attr('y', function(d,i) { return i*config.infoPanelItemHeight+config.infoPanelTop;})
			.attr('height', 10)
			.attr('width', maxValue*config.infoPanelWidth)
			.attr('fill-opacity', 0.1)
            .style('fill', "rgb(14,47,68)");
           // .style('fill', function(d){return d.dcolor;});

		// Infobars
		var bars = root.selectAll('bar_')
			.data(dimensionNodes)
			.enter().append('rect')
			.classed('bar_', true)
			.attr("rx", 3)
			.attr("ry", 3)
			.attr('x', config.infoPanelLeft)
			.attr('y', function(d,i) { return i*config.infoPanelItemHeight+config.infoPanelTop;})
			.attr('height', 10)
			.attr('width', 1)
			.attr('fill-opacity', 0.75)
			.call(drag)
			.data(dimensionsColors)
            .style('fill', "rgb(14,47,68)")
           // .style('fill', function(d){return d.dcolor;})
			.on('mouseenter', function(d,i) {
				this.classList.add('active');	
				/*textValues
				.filter(function(d1, i1){return i == i1;})
				.text(d);*/
				textValues
				.filter(function(d1, i1){return i == i1;})
				.text(data[currentElm][config.dimensions[i]]);
			})
			.on('mouseout', function(d) {
				this.classList.remove('active');
				textValues.text('');
			})
			.on('drag', function(d){
				
				var x = d3.event.x;
			var y = d3.event.y;
			config.infoPanelLeft = x;
			config.infoPanelTop = y;
			});
		
        // Nodes
        var nodes = root.selectAll('circle.dot_')
            .data(data)
            .enter().append('circle')
            .classed('dot_', true)
			.attr('fill-opacity', 0.75)
            .attrs({
                r: function(d) {
                    return +d[Class]*config.dotSize+config.dotMinSize;
                },
            })
			.style("fill", function(d,i){	   		// Set up colors				
					var color = dimensionsColors[+config.colors[i]];
					return color.dcolor;				
				})
		/*	.style("stroke", function(d,i){	   		// Set up colors				
					var color = dimensionsColors[+config.colors[i]];
					return d3.rgb(color.dcolor).darker(1);				
				})*/
            .on('mouseenter', function(d,i) {
                if(config.useTooltip) {
                    var mouse = d3.mouse(config.el);
                    tooltip.setText(d.Name).setPosition(mouse[0], mouse[1]).show();
                }
                //events.dotEnter(d);
                this.classList.add('active');
				currentElm = i;
				
                //highlighting the links of selected node
				var selLinks = root.selectAll('.link_')
					.data(linksData)
					.filter(function(dn) {return dn.source == d})
					.attr("stroke-width", 1)
					.attr("stroke-opacity", function(dn) {return dn.alpha*config.alphaVec})
					//.attr("stroke", function(dn){return dn.color.dcolor;})
					.attr("stroke","rgb(14,47,68)")
					.classed('link_', true);	
               
                //Data for update arcs
                var selectedValues = [];
                dimensionNamesNormalized.forEach(function(dB, iB){
			         selectedValues[iB] = +d[dB];
                });  
				
			//	var testando1 = d.State;
				selected.text(d.Name);
				
				//Update bars
				bars.data(selectedValues)
					.transition(300)
					.attr("width", function(d){return d*config.infoPanelWidth;});
                
                //Update arcs
                arcsOut.data(selectedValues)
                    .transition()
                    .duration(300)
                    .style("fill", function(d){return arcColor(d);})
                    .attrTween("d", arc2Tween);          
            })
            .on('mouseout', function(d) {
                if(config.useTooltip) {
                    tooltip.hide();
                }
                //events.dotLeave(d);
                this.classList.remove('active');
				
				var nlks = root.selectAll('.link_')
					.data(linksData)
					.filter(function(dn) {return dn.source == d})
					.attr("stroke-width", 1)
					.attr("stroke", "silver")
					.attr("stroke-opacity", 0.05);

				
				var selectedValues = [];
				config.dimensions.forEach(function(dB, iB){
			         selectedValues[iB] = 0;
                });
				
				 //Update arcs
                arcsOut.data(selectedValues)
                    .transition()
                    .duration(300)
                    .style("fill", function(d){return arcColor(d);})
                    .attrTween("d", arc2Tween);  
			
             });
			
		
        var labels = root.selectAll('text.label_')
            .data(dimensionNodes)
            .enter().append('text')
            .classed('label_', true)
            .attrs({
                x: function(d) {
                    return d.x;
                },
                y: function(d) {
                    if(d.x > (panelSize * 0.4) && d.x < (panelSize * 0.6) && d.y < 5.0) {
                        return d.y-10;
                    } else {
                        return d.y+10;
                    }
                },
                'text-anchor': function(d) {
                    if(d.x > (panelSize * 0.4) && d.x < (panelSize * 0.6)) {
                        return 'middle';
                    } else {
                        return(d.x > panelSize / 2) ? 'start' : 'end';
                    }
                },
                'dominant-baseline': function(d) {
                    return(d.y > panelSize * 0.6) ? 'hanging' : 'auto';
                },
                dx: function(d) {
					if (d.y > panelSize * 0.6)
						return (d.x > panelSize / 2) ? '10px' : '-10px';
					else
						return (d.x > panelSize / 2) ? '20px' : '-20px';
                },
                dy: function(d) {
                    return(d.y > panelSize * 0.6) ? '6px' : '-6px';
                }
            })
            .text(function(d) {
                return d.name.replace("_normalized", "");
            });

        //ARCs with proportions
     //   var vis = d3.select("svg#reg");
        var arc = d3.arc()
            .innerRadius(chartRadius-config.arcwidth1/2+config.arcDistance)
            .outerRadius(chartRadius+config.arcwidth1/2+config.arcDistance)
            .cornerRadius(2)
            .startAngle(function(d,i){return config.angleTable[i]+Math.PI/2-arcRatio(d)-config.arcMinSize;})
            .endAngle(function(d,i){return config.angleTable[i]+Math.PI/2+arcRatio(d)+config.arcMinSize;});
        
        var arc2 = d3.arc()
            .innerRadius(chartRadius-config.arcwidth2/2+config.arcDistance2)
            .outerRadius(chartRadius+config.arcwidth2/2+config.arcDistance2)
            .cornerRadius(2)
            .startAngle(function(d,i){return config.angleTable[i]+Math.PI/2-arcRatio(d3.max(config.dbBalance))-config.arcMinSize;})
            .endAngle(function(d,i){return config.angleTable[i]+Math.PI/2+arcRatio(d3.max(config.dbBalance))+config.arcMinSize;});
        
       var arc3 = d3.arc()
            .innerRadius(chartRadius-config.arcwidth3/2+config.arcDistance3)
            .outerRadius(chartRadius+config.arcwidth3/2+config.arcDistance3)
            .cornerRadius(2)
            .startAngle(function(d,i){return config.angleTable[i]+Math.PI/2-arcRatio2(d)-config.arcRefMinSize;})
            .endAngle(function(d,i){return config.angleTable[i]+Math.PI/2+arcRatio2(d)+config.arcRefMinSize;});
        

        var arcRef = root.selectAll("path_")
            .data(dimensionNodes)
            .enter()
            .append("path")
            .attr("class", "arc")
			.attr("id","arcref")
            .attr("d", arc2)
            .style("fill", "rgb(50,50,50)")
            .attr("transform", 'translate('+[config.chartRadius, config.chartRadius]+')')
            .call(drag)
            .on('mouseover', function(d) {
				Class = d.name;
				d3.selectAll('circle.dot_')
				.transition()
                .duration(300)
				.attrs({
                r: function(d){
                    return +d[Class]*config.dotSize+config.dotMinSize;},
				})

             })
            .on('mouseout', function(d) {
               Class = 'elemSize';
				d3.selectAll('circle.dot_')
				.transition()
                .duration(300)
				.attrs({
                r: function(d){
                    return +d.elemSize*config.dotSize+config.dotMinSize;},
				})
            });
        
        // ARC dimensions balance
       var arcD = root.selectAll("path2_")
            .data(Array(config.dimensions.length).fill(1))
            .enter()
            .append("path")
            .attr("d", arc)
			.attr("id","arcD")
			.style("fill",function (d,i){
					return "rgb(158,171,180)";})
            .attr("transform", 'translate('+[config.chartRadius, config.chartRadius]+')');
			
            
         var arcsOut = root.selectAll("path3_")
            .data(dimensionNodes)
            .enter()
            .append("path")
            .attr("class", "arc")
			.attr("id","arcout")
            .attr("d", arc3)
            .style("fill", "rgb(50,50,50)")
            .attr("transform", 'translate('+[config.chartRadius, config.chartRadius]+')');
        
        function arc2Tween(d, indx) {
            var interp = d3.interpolate(this._current, d);
            this._current = d;
            return function(t) {
                var tmp = interp(t); 
                return arc3(tmp, indx);
            }
        };
        
        window.updateArcs_ = function updateArcs_(i){
            arcRef.data(dimensionNodes).attr("d",arc2);
            arcD.data(Array(config.dimensions.length).fill(1)).attr("d",arc);
            dimensionNodes[i].x = chartRadius + Math.cos(config.angleTable[i]) * chartRadius * config.zoomFactor;
            dimensionNodes[i].y = chartRadius + Math.sin(config.angleTable[i]) * chartRadius * config.zoomFactor;
			dimensionNodes[i].fx = chartRadius + Math.cos(config.angleTable[i]) * chartRadius * config.zoomFactor;
            dimensionNodes[i].fy = chartRadius + Math.sin(config.angleTable[i]) * chartRadius * config.zoomFactor;
            dimensionNodes[i].px = dimensionNodes[i].x;
            dimensionNodes[i].py = dimensionNodes[i].y;
            labels.data(dimensionNodes).attrs({
                x: function(d) {
                    return d.x;
                },
                y: function(d) {
                    if(d.x > (panelSize * 0.4) && d.x < (panelSize * 0.6) && d.y < 5.0) {
                        return d.y-5;
                    } else {
                        return d.y;
                    }
                },
                'text-anchor': function(d) {
                    if(d.x > (panelSize * 0.4) && d.x < (panelSize * 0.6)) {
                        return 'middle';
                    } else {
                        return(d.x > panelSize / 2) ? 'start' : 'end';
                    }
                },
                'dominant-baseline': function(d) {
                    return(d.y > panelSize * 0.6) ? 'hanging' : 'auto';
                },
                dx: function(d) {
                    return(d.x > panelSize / 2) ? '6px' : '-6px';
                },
                dy: function(d) {
                    return(d.y > panelSize * 0.6) ? '6px' : '-6px';
                }
            })
            .text(function(d) {
                return d.name.replace("_normalized", "");
            });
            
            // updateing the nodes positions by restarting the force        
            force.alpha(.5).restart();
        };

        
        /////////////////////////////////////////////////////////
         
        // Update force
        force.on('tick', function() {
            if(config.drawLinks) {
                links.attrs({
                    x1: function(d) {
                        return d.source.x;
                    },
                    y1: function(d) {
                        return d.source.y;
                    },
                    x2: function(d) {
                        return d.target.x;
                    },
                    y2: function(d) {
                        return d.target.y;
                    }
                });
            }

            nodes.attrs({
                cx: function(d) {
                    return d.x;
                },
                cy: function(d) {
                    return d.y;
                }
            });
        });
		
		/*function ticked() {
			link
				.attr("x1", function(d) { return d.source.x; })
				.attr("y1", function(d) { return d.source.y; })
				.attr("x2", function(d) { return d.target.x; })
				.attr("y2", function(d) { return d.target.y; });

			node
				.attr("cx", function(d) { return d.x; })
				.attr("cy", function(d) { return d.y; });
			d3.select('#alpha_value').style('flex-basis', (simulation.alpha()*100) + '%');
		}	*/
        

        return this;
    };
    
     
    var drag = d3.drag()
        .on("drag", dragmove)
		.on("end", dragEnd)
		.on("start", dragStart);

    //grag and drop calcs here    
    function dragmove(d, i) {
        var x = d3.event.x;
        var y = d3.event.y;
	//	var hx = +d3.select(this).attr("x")+d3.event.dx;
		if (this.localName == 'path') {
			
			var ang = angle(x, y, (config.size / 2 - config.margin), (config.size / 2 - config.margin));
    // 	  	d3.select(this).attr("transform", "translate(" + x + "," + y + ")");
			config.angleTable[i] = ang;
			window.updateArcs_(i);
			
			
			// remover ancoras dimensionais
			/*var dragRadius = Math.sqrt((x-(config.size / 2 - config.margin))*(x-(config.size / 2 - config.margin))+(y-(config.size / 2 - config.margin))*(y-(config.size / 2 - config.margin)));
			if ((dragRadius>config.chartRadius*1.4) && (config.dimensions.indexOf(d.name.replace("_normalized", ""))>-1)){
				var removedAttr = config.dimensions.splice(config.dimensions.indexOf(d.name.replace("_normalized", "")),1);
				nextAtt(config.dimensions);
				
			}*/
			
		} else if (this.localName == 'rect') {
		 	x -= config.infoPanelLeft+50;
            y -= config.infoPanelTop;
			
           // d3.selectAll('rect').attr("transform", function(d,i){return "translate("+x+","+y+")";});
			d3.selectAll('.bar_').attr("transform", function(d,i){return "translate("+x+","+y+")";});
		} else if (this.localName == 'circle') {			// if the user is trying to multi select inside the mais circunference
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
			
			d3.selectAll(".quad_r")
				.attr("x", basequadX)
				.attr("y", basequadY)
				.attr("width", selquadW)
				.attr("height",selquadH);
		
		} 
    }
	
	function dragStart(d, i){
		var x = d3.event.x;
        var y = d3.event.y;
		selquadX = x;
		selquadY = y;		
	}
	
	
	function dragEnd(d, i) {
		var x = d3.event.x;
        var y = d3.event.y;
		
		d3.selectAll(".quad_r")		//hidding the bounding box
				.attr("x",0)
				.attr("y",0)
				.attr("width", 0)
				.attr("height",0);
				
		if (this.localName == 'path') {	
			// remove dimensional anchors from data view
			// calc the distance between the center and the drag pointer position
			var dragRadius = Math.sqrt((x-(config.size / 2 - config.margin))*(x-(config.size / 2 - config.margin))+(y-(config.size / 2 - config.margin))*(y-(config.size / 2 - config.margin)));
			//test if the user dragged away
			if ((dragRadius>config.chartRadius*1.5) && (config.dimensions.indexOf(d.name.replace("_normalized", ""))>-1)){
				var removedAttr = config.dimensions.splice(config.dimensions.indexOf(d.name.replace("_normalized", "")),1);
				nextAtt(config.dimensions);
				radviz[0].removeAttr(removedAttr[0]);
				
			}
			
		} else if (this.localName == 'circle') {	//bounding box selecting samples		
			selectedSamples = [];
			d3.selectAll(".dot_")
				.filter(function(dn,i) {
					if (dn.x > basequadX && dn.x < basequadX+selquadW && dn.y > basequadY && dn.y < basequadY+selquadH)
						selectedSamples.push(dn.id);
							return dn.x > basequadX && dn.x < basequadX+selquadW && dn.y > basequadY && dn.y < basequadY+selquadH})
				.attr('stroke-width',1.5);				
				//update the visualization
				sampleAction(selectedSamples);
		}
		
		
		
		
	}

    var setConfig = function(_config) {
        config = utils.mergeAll(config, _config);
        return this;
    };
	

    
    //Angle calculation
    function angle(cx, cy, ex, ey) {
        var dy = -(ey - cy);
        var dx = -(ex - cx);
        var theta = Math.atan2(dy, dx); // range (-PI, PI]
      //  theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
        if (theta < 0) theta = 2*Math.PI + theta; // range [0, 360)
        //console.log(theta);
        return theta;
    }

    var addNormalizedValues = function(data) {
        data.forEach(function(d) {
            config.allDimensions.forEach(function(dimension) {
                d[dimension] = +d[dimension];
            });
        });

        var normalizationScales = {};
        config.allDimensions.forEach(function(dimension) {
            normalizationScales[dimension] = d3.scaleLinear().domain(d3.extent(data.map(function(d, i) {
                return +d[dimension];
            }))).range([0, 1]);
        });

        data.forEach(function(d) {
            config.allDimensions.forEach(function(dimension) {
                d[dimension + '_normalized'] = normalizationScales[dimension](d[dimension]);
            });
        });

        return data;
    };
	
		function updateColors(mode){
			if (mode)
				d3.selectAll('.dot_').style("fill", function(d,i){return d.nearestColor;});
			else
				d3.selectAll('.dot_').style("fill", function(d,i){return d.linearColor;});
			
			
		};	
		
		function setBarsVisible(mode){
			if (mode){
				d3.selectAll('.bar_').attr("visibility", "visible");
				d3.selectAll('.bar2').attr("visibility", "visible");
			}
			else{
				d3.selectAll('.bar_').attr("visibility", "hidden");
				d3.selectAll('.bar2').attr("visibility", "hidden");
			}
		};
		
		function resizeElements(newsize){
			d3.selectAll('.dot_').attr("r", function(d){return +d['elemSize']*newsize+config.dotMinSize;});			
		}
		
		function setTransparency(opacityValue){
			config.elemOpacity = opacityValue;
			d3.selectAll('.dot_').attr('fill-opacity', config.elemOpacity);
		};	
		
		function deleteALL(){
			var svg = d3.select("svg#reg");
			svg.selectAll("*").remove();
		}
		
		function hoverAttribute(selAtt){
				selAtt = selAtt+'_normalized';
				d3.selectAll('circle.dot_')
				.transition()
                .duration(300)
				.attrs({
                r: function(d){
                    return +d[selAtt]*config.dotSize+config.dotMinSize;},
				})
		}
		
		function hoverOutAttribute(){
				d3.selectAll('circle.dot_')
				.transition()
                .duration(300)
				.attrs({
                r: function(d){
                    return +d.elemSize*config.dotSize+config.dotMinSize;},
				})
		}
		
		function highlightElem(eName){
			d3.selectAll('.dot_').attr('fill-opacity',0.1);
			d3.selectAll('.dot_')
			.filter(function(dn) {
						return dn.Name == eName})
			.attr('fill-opacity',config.elemOpacity);			
		}
		
		function undoHighlight(){
			d3.selectAll('.dot_').attr('fill-opacity', config.elemOpacity);
		};	

		function hideNshow(eName,vis){
			d3.selectAll('.dot_')
				.filter(function(dn){return dn.Name == eName})
				.style('visibility', this.visibility = (vis == "black" ? "visible" : "hidden"));
			
		};
		
		function getAngles(){
			//var readkey = 13;
			//var angles = config.angleTable.slice();
			return config.angleTable;			
		};
		
		function changeForce(val){
			config.collideRatio = val;
			force.force("collide",d3.forceCollide( function(d){
					return (d.elemSize*config.dotSize+config.dotMinSize)*config.collideRatio;}).iterations(1));
			force.alpha(.5).restart();			
		};
		
		function changeStrength(newStrength) {
			force.force("link", d3.forceLink(linksData).strength( function(d) { 
					return Math.pow(d.alpha+0.01,newStrength); }));
			force.alpha(.5).restart();
		};
		
		
		function getSilhouette(){
			var b_i_vector = [];
			var a_i_vector = [];
			var b_i_averages = [];
			var counter = [];
			var b_i = 0;
			var a_i = 0;
			var sum = 0;
			var points = d3.selectAll('.dot_');
			for (var i=0;i<points._groups[0].length;i++){
				b_i_vector = [];
				b_i_averages = new Array(config.labelSet.length).fill(0);
				counter = new Array(config.labelSet.length).fill(0);
				a_i_vector = [];
				// calcs b_i
				for (var j=0;j<points._groups[0].length;j++)
					//if (points._groups[0][i].style.fill != points._groups[0][j].style.fill)
					if ((config.colors[i] != config.colors[j]) && (j!=i)){
						b_i_vector.push(eucDistance([points._groups[0][i].cx.baseVal.value,points._groups[0][i].cy.baseVal.value],[points._groups[0][j].cx.baseVal.value,points._groups[0][j].cy.baseVal.value]))
						
						b_i_averages[config.colors[j]] += eucDistance([points._groups[0][i].cx.baseVal.value,points._groups[0][i].cy.baseVal.value],[points._groups[0][j].cx.baseVal.value,points._groups[0][j].cy.baseVal.value]);
						counter[config.colors[j]] += 1;
					}
					
					for (var w=0;w<b_i_averages.length;w++)
						if (counter[w] == 0){
							
							b_i_averages.splice(w,1);
							counter.splice(w,1);
						}			
							
					for (var w=0;w<b_i_averages.length;w++)
							b_i_averages[w] = b_i_averages[w]/counter[w];					
					
					
					b_i = b_i_averages.min();
				
				// calcs a_i
				for (var j=0;j<points._groups[0].length;j++)
					//if (points._groups[0][i].style.fill == points._groups[0][j].style.fill)
					if ((config.colors[i] == config.colors[j]) && (j!=i))
						a_i_vector.push(eucDistance([points._groups[0][i].cx.baseVal.value,points._groups[0][i].cy.baseVal.value],[points._groups[0][j].cx.baseVal.value,points._groups[0][j].cy.baseVal.value]))
					a_i = average(a_i_vector);

				sum += (b_i - a_i)/([a_i,b_i].max());
			}
			
			return sum/points._groups[0].length;
			
		};
		
	
    var exports = {
        config: setConfig,
        render: render,
		updateColors: updateColors,
		setBarsVisible: setBarsVisible,
		resizeElements: resizeElements,
		setTransparency: setTransparency,
		hoverAttribute: hoverAttribute,
		hoverOutAttribute: hoverOutAttribute,
		deleteALL: deleteALL,
		highlightElem: highlightElem,
		undoHighlight: undoHighlight,
		hideNshow: hideNshow,
		changeForce: changeForce,
		changeStrength: changeStrength,
		getAngles: getAngles,
		getSilhouette: getSilhouette
    };

    //d3.rebind(exports, events, 'on');

    return exports;
};
