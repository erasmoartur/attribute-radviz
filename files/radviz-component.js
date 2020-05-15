var radvizComponent = function () {
    var config = {
        el: null,
		identifierName: null,
		colorMode: false,
		nodeBorder: true,
        size: 550,
        margin: 90,
		marginTop: 130,
		arcwidth1: 5.5,
		arcwidth2: 9,
		arcwidth3: 4.5,
		arclenght: 0.52,
        arcMinSize: 0.02,
		arcRefMinSize: 0,
        arcDistance: -2.5,
        arcDistance2: 2.5,
        arcDistance3: 8.5,
		infoPanelSize: 110,
		infoPanelLeft: 455,
		chartRadius: 185,
		infoPanelTop:-45,
		infoPanelBot: 235,
		infoPanelWidth: 100,
		forceStrength: 1,
		infoPanelItemHeight: 12,
		mainCicleStroke: 1.5,
		collideRatio: 0,
		dotSize: 20,
		dotMinSize: 2,
		multiSel: 5,
        colorAccessor: null,
        dimensions: [],
		selDimensions: [],
        dbBalance: [],
        angleTable: [],
        drawLinks: false,
        zoomFactor: 1,
        dotRadius: 5,
        dimDotRadius: 3,
        useRepulsion: false,
        useTooltip: true,
        firstrun: true,
		alphaVec: 1.5,
		elemOpacity: 0.75,
        tooltipFormatter: function(d) {
            return d;
        }
    };
	
	

	var Class = 'elemSize';
	var selectedLabel = null;

    var events = d3.dispatch('panelEnter', 'panelLeave', 'dotEnter', 'dotLeave');
    
    var force;
	var selquadX, selquadY, basequadX, basequadY;
	var selquadW, selquadH;
	
	//Calcs the link vector plus its colors
    var linksData = [];
		
		
    var render = function(data) {
        data = addNormalizedValues(data);
        var normalizeSuffix = '_normalized';
        var dimensionNamesNormalized = config.dimensions.map(function(d) {
            return d + normalizeSuffix;
        });
        
    var thetaScale = d3.scaleLinear()
        .domain([0, dimensionNamesNormalized.length])
        .range([0, Math.PI * 2]);


        config.chartRadius = config.size / 2 - config.margin;
        var nodeCount = data.length;
        var panelSize = config.size - config.margin * 2;
		
		
		// Generated in "i want hue" site
		var R = [121,163,92,207,143,94,196,197,61,223,92,206,63,225,94,218,142,107,228,54,173,172,199,83,227,162,159,217,164,137];
		var G = [157,91,196,76,178,108,181,144,144,54,191,62,193,109,149,146,82,116,117,129,57,189,74,108,134,147,79,162,87,105];
		var B = [82,205,84,168,53,204,57,213,55,102,137,41,191,56,207,48,140,27,162,91,104,118,74,43,127,66,87,106,43,42];
		
		// Google 20c color scale
		if (config.dimensions.length < 20){
		var R = [51,220,255,16,153,0,221,102,184,49,153,34,170,102,230,139,101,50,85,59];
		var G = [102,57,153,150,0,153,68,170,46,99,68,170,170,51,115,7,16,146,116,62];
		var B = [204,18,0,24,153,198,119,0,46,149,153,153,17,204,0,7,103,98,166,172];
		}
		// If there are few labels fill up with google 10c color scale
		if (config.dimensions.length < 10){
			R = [51,220,255,16,153,0,221,102,184,49];
			G = [102,57,153,150,0,153,68,170,46,99];
			B = [204,18,0,24,153,198,119,0,46,149];
		}
		
        var dimensionsColors = [];
		
		config.dimensions.forEach(function(dB, iB){
			dimensionsColors.push({
				dcolor:'rgb('+R[iB]+','+G[iB]+','+B[iB]+')'
			});
		});
		
		/*if (d3.select('svg#container')._groups[0][0]){ // If SVG already exists, delete all
				d3.select('svg#container').remove();
				config.firstrun = true;
		};*/

        //Calcs the dimensions nodes posicions
        var dimensionNodes = config.dimensions.map(function(d, i) {
            if (config.firstrun)
                config.angleTable[i] = thetaScale(i);
            var x = config.chartRadius + Math.cos(config.angleTable[i]) * config.chartRadius * config.zoomFactor;
            var y = config.chartRadius + Math.sin(config.angleTable[i]) * config.chartRadius * config.zoomFactor;
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

		//computing links
		linksData = [];
        data.forEach(function(d, i) {
            config.dimensions.forEach(function(dB, iB){
                linksData.push({
                    source: i,
                    target: nodeCount + iB,
					alpha: Math.abs(d[dB]),
					color: dimensionsColors[iB],
                    value: d[dB]
                });
                if (maxValue<Math.abs(d[dB])) maxValue = Math.abs(d[dB]);
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
		
		// Calcs indexes of best color fit
		var colorInfo = [];
		var tempColor = [];
		
		data.forEach(function(d, i) {
			var max = 0,ind = 0;
            config.dimensions.forEach(function(dB, iB) {
				aux =  Math.abs(d[dB]);
                if (max < aux) {max = aux; ind = iB;}
            });
			colorInfo[i]=dimensionsColors[ind];
			tempColor.push(ind);
        });
		
		
		// Calcs individual color (linear combination)
		var _R = [];
		var _G = [];
		var _B = [];
		data.forEach(function(d, i) {
			var sum = 0;
			_R[i] = 0; _G[i] = 0; _B[i] = 0;
			config.dimensions.forEach(function(dB, iB) {
				_R[i] += R[iB]*Math.abs(d[dB]);
				_G[i] += G[iB]*Math.abs(d[dB]);
				_B[i] += B[iB]*Math.abs(d[dB]);
				sum += Math.abs(d[dB]);
			});
			
			_R[i] = _R[i]/sum;
			_G[i] = _G[i]/sum;
			_B[i] = _B[i]/sum;
			if (sum == 0) {_R[i] = 0; _G[i] = 0; _B[i] = 0;}
		});
		
		data.forEach(function(d, i){
			d.nearestColor=colorInfo[i].dcolor;
			d.linearColor='rgb('+parseInt(_R[i])+','+parseInt(_G[i])+','+parseInt(_B[i])+')';
		});

		/*var forceCollide = d3.forceCollide()
			.radius(function(d) { return d.radius + 1.5; })
			.iterations(1);*/
	
		
		force = d3.forceSimulation(data.concat(dimensionNodes))
			.force("collide",d3.forceCollide( function(d){
					return (d.elemSize*config.dotSize+config.dotMinSize)*config.collideRatio;}).iterations(1))
		    .force("link", d3.forceLink(linksData).strength( function(d) { 
					return Math.pow(d.alpha,config.forceStrength)+0.01; }));
					
					
			
		var svg = d3.select(config.el).append("svg")
            .attr("width", config.size + config.infoPanelSize)
            .attr("height", config.size + 100)
			.attr("id","rad");


     /*   svg.append('rect')
            .classed('bg', true)
            .attrs({
                width: config.size + config.infoPanelSize,
                height: config.size				
            });*/

        /*var root = svg.append('g')
            .attrs({
                transform: 'translate(' + [config.margin, config.marginTop] + ')'
            });*/

		var root = svg.append("g")
			.attr("transform",
					"translate(" + config.margin + "," + config.marginTop + ")");
			
        var panel = root.append('circle')
            .classed('panel', true)
            .attrs({
                r: config.chartRadius,
                cx: config.chartRadius,
                cy: config.chartRadius,
            })
			.style("stroke","rgb(50,50,50)")
			.style('stroke-width', config.mainCicleStroke)
			.call(drag);
			//.attr('pointer-events', 'none');
		//	.style('fill', 'rgb(245,245,245)');
			
		
		var selectQuad = root.append('rect')		// the bounding box
			.attr("x",50)
			.attr("y",50)
			.attr("width", 0)
			.attr("height",0)
			.classed('quad', true)
			.attr("fill-opacity", 0.25)
			.style("fill", 'red')
			.attr("stroke","rgb(0, 0, 0)")
			.style("stroke-width", 0.25);
		
		
		
		
       /* if(config.useRepulsion) {
            root.on('mouseenter', function(d) {
               // force.chargeDistance(40).alpha(0.2);
                events.panelEnter();
            });
            root.on('mouseleave', function(d) {
              //  force.chargeDistance(0).resume();
                events.panelLeave();
            });
        }*/

        // Links
        if(config.drawLinks) {
			var links = root.selectAll('.link')
				.data(linksData)
				.enter().append('line')
				.attr("stroke","silver")
				.attr("stroke-opacity", 0.05)
				.classed('link', true)
				.attr('pointer-events', 'none');			
        }
		
		// Graphic title
		var gTitle = root.selectAll('.title')
			.data([''])
			.enter().append('text')
			.classed('inf', true)
			.attr('x', config.chartRadius)
			.attr('y', -35)
			.attr('font-size', 25)
			.attr('text-anchor','middle')
			.style('fill','rgb(180,190,192)')
			.text('Attribute View');
			
		// Data size
		var dataSizeText = root.selectAll('.title')
			.data([''])
			.enter().append('text')
			.classed('inf', true)
			//.attr('text-anchor','middle')
			.attr('x', config.chartRadius)
			.attr('y', config.chartRadius*2 + 55)
			.attr('font-size', 18)
			.attr('text-anchor','middle')
			.style('fill','rgb(180,190,192)')
			.text(data.length+' attributes');
			
		// Text attribute
		var selected = root.selectAll('.title')
			.data([''])
			.enter().append('text')
			.classed('bar', true)
			//.attr('text-anchor','middle')
			.attr('x', config.infoPanelLeft)
			.attr('y', config.infoPanelTop - 5)
			.attr('font-size', 14)
			.text('');
			
		var textValues = root.selectAll('.title')
			.data(dimensionNodes)
			.enter().append('text')
			.classed('bar', true)
			.attr('x', config.infoPanelLeft + maxValue * config.infoPanelWidth)
			.attr('y', function(d,i) { return i*config.infoPanelItemHeight+config.infoPanelTop+11;})
			.attr('font-size', 10)
			.text(function (d,i){return '';});
			
		var shadowbars = root.selectAll('bar')
			.data(dimensionNodes)
			.enter().append('rect')
			.classed('bar', true)
			.call(drag)
			.attr("rx", 3)
			.attr("ry", 3)
			.attr('x', config.infoPanelLeft)
			.attr('y', function(d,i) { return i*config.infoPanelItemHeight+config.infoPanelTop;})
			.attr('height', 10)
			.attr('width', maxValue*config.infoPanelWidth)
			.attr('fill-opacity', 0.1)
			.data(dimensionsColors)
            .style('fill', function(d){return d.dcolor;});

		// Infobars
		var bars = root.selectAll('bar')
			.data(dimensionNodes)
			.enter().append('rect')
			.classed('bar', true)
			.attr("rx", 3)
			.attr("ry", 3)
			.attr('x', config.infoPanelLeft)
			.attr('y', function(d,i) { return i*config.infoPanelItemHeight+config.infoPanelTop;})
			.attr('height', 10)
			.attr('width', 1)
			.attr('fill-opacity', config.elemOpacity)
			.call(drag)
			.data(dimensionsColors)
            .style('fill', function(d){return d.dcolor;})
			.on('mouseenter', function(d,i) {
				this.classList.add('active');	
				textValues
				.filter(function(d1, i1){return i == i1;})
				.text(d);
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
			
			
		// Rankbars
		var rankshadowbars = root.selectAll('bar')
			.data([1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1])
			.enter().append('rect')
			.classed('bar',true)
			.attr("rx", 3)
			.attr("ry", 3)
			.attr('x', config.infoPanelLeft)
			.attr('y', function(d,i) { return i*config.infoPanelItemHeight+config.infoPanelTop+config.infoPanelBot;})
			.attr('height', 10)
			.attr('width', maxValue*config.infoPanelWidth)
			.attr('fill-opacity', 0.1)
			.style('fill', 'rgb(50,50,50)');
			
		var rankbars = root.selectAll('bar')
			.data(data.sort(function(a, b) {
				return Math.abs(+b[Class]) - Math.abs(+a[Class]);}))
			.enter().append('rect')
			.classed('bar',true)
			.filter(function(dn,i) {return i<20})
			.attr("rx", 3)
			.attr("ry", 3)
			.attr('x', config.infoPanelLeft)
			.attr('y', function(d,i) { return i*config.infoPanelItemHeight+config.infoPanelTop+config.infoPanelBot;})
			.attr('height', 10)
			.attr("width", function(d){return Math.abs(d[Class])*config.infoPanelWidth;})
			.attr('fill-opacity', config.elemOpacity)
			.style("fill", function(d){				//Switches color by linear or nearest
				if (config.colorMode)
					return d.linearColor;
				else				
					return d.nearestColor;				
				})
			.on('mouseenter', function(d) {
				highlightElem(d.Name);
				
				//tooltip
				if(config.useTooltip) {
                    var mouse = d3.mouse(config.el);
                    tooltip.setText(d.Name).setPosition(mouse[0], mouse[1]).show();
                }
				
				//Data for update arcs
                var selectedValues = [];
                config.dimensions.forEach(function(dB, iB){
			         selectedValues[iB] = +d[dB];
                });				
				
				//Update the info bars
				selected.text(d.Name);
				bars.data(selectedValues)
					.transition(300)
					.attr("width", function(d){return Math.abs(d)*config.infoPanelWidth;});	
				if ((typeof regularRadviz !== 'undefined') && (d.Name != config.identifierName))		//test if the second view is already active
					regularRadviz.hoverAttribute(d.Name);
			})
			.on('mouseout', function(d) {
				undoHighlight();
				
				//hide tooltip
				if(config.useTooltip) {
                    tooltip.hide();
                }
				
				
				if (typeof regularRadviz !== 'undefined')			//test if the second view is already active
					regularRadviz.hoverOutAttribute();			
			})
			.on('click', function(d){
			 
			 if (config.selDimensions.indexOf(d.Name) > -1){		//Already in
				// undo highlight (bar)
				/*d3.select(this).attr('stroke-width',1.0)
							   .style("stroke", function(d){				//Switches color by linear or nearest
									if (config.colorMode)
										return d3.rgb(d.linearColor).darker(1);
									else				
										return d3.rgb(d.nearestColor).darker(1);			
									});	*/
				// undo highlight (node)
				d3.selectAll('.dot')
						.filter(function(dn) {
									return dn.Name == d.Name})
						.attr('stroke-width',1.0)
						.style("stroke", function(d){				//Switches color by linear or nearest
									if (config.colorMode)
										return d3.rgb(d.linearColor).darker(1);
									else				
										return d3.rgb(d.nearestColor).darker(1);			
									});					
				config.selDimensions.splice(config.selDimensions.indexOf(d.Name),1); 		//Removing the element			 
			 }
			 else
			 {
				 // highlighting the bar
				/* d3.select(this).attr('stroke-width',1.5)
								.style("stroke", function(d){				//Switches color by linear or nearest
									if (config.colorMode)
										return d3.rgb(d.linearColor).darker(3);
									else				
										return d3.rgb(d.nearestColor).darker(3);			
									});*/
				// highlightinh the node
						d3.selectAll('.dot')
						.filter(function(dn) {
									return dn.Name == d.Name})
						.attr('stroke-width',1.5)
						.style("stroke", function(d){				//Switches color by linear or nearest
									if (config.colorMode)
										return d3.rgb(d.linearColor).darker(3);
									else				
										return d3.rgb(d.nearestColor).darker(3);			
									});					
				config.selDimensions.push(d.Name);				// Inserting the element				 
			 }
			 regularRadviz.deleteALL();	
			 nextAtt(config.selDimensions);		
			 });
		
		//rank title
		
		var ranktitle = root.selectAll('.title')
			.data([''])
			.enter().append('text')
			.classed('bar', true)
			//.attr('text-anchor','middle')
			.attr('x', config.infoPanelLeft)
			.attr('y', config.infoPanelTop + +config.infoPanelBot-5)
			.attr('font-size', 14)
			.text('Attributes Rank');
			
		// text on inferior bars
		
		/*var textSubs = root.selectAll('.title_')
			.data(data)
			.enter().append('text')
			.classed('bar', true)
			.filter(function(dn,i) {return i<20})
			.attr("font-family", "sans-serif")
			.attr("fill","rgb(80,80,80)")
			.style("font-weight","bold")
			.style('text-anchor','middle')	
			.attr('x', config.infoPanelLeft + maxValue * config.infoPanelWidth/2)
			.attr('y', function(d,i) { return i*config.infoPanelItemHeight+config.infoPanelTop+242;})
			.attr('font-size', 10)
			.attr('pointer-events', 'none')
			.attr("visibility", "hidden")
			.text(function (d,i){return d.Name;});*/
		
		
        // Nodes
        var nodes = root.selectAll('circle.dot')
            .data(data)
            .enter().append('circle')
			//.style("stroke", 'black')
            .classed('dot', true)
			.attr('fill-opacity', config.elemOpacity)
            .attrs({
                r: function(d) {
                    return Math.abs(+d[Class])*config.dotSize+config.dotMinSize;
                },
            })
			.style("stroke", function(d){				//Switches color by linear or nearest
				if (config.colorMode)
					return d3.rgb(d.linearColor).darker(1);
				else				
					return d3.rgb(d.nearestColor).darker(1);			
				})
			.style("stroke-opacity", function(d){
				if (config.nodeBorder)
					return 1;
				else
					return 0;
				})
			.style("fill", function(d){				//Switches color by linear or nearest
				if (config.colorMode)
					return d.linearColor;
				else				
					return d.nearestColor;				
				})

            .on('mouseenter', function(d) {
				
				
                if(config.useTooltip) {
                    var mouse = d3.mouse(config.el);
                    tooltip.setText(d.Name).setPosition(mouse[0], mouse[1]).show();
                }
             //   events.dotEnter(d);
            //    this.classList.add('active');
				d3.select(this).attr('fill-opacity',1);
				
				
                //highlighting the links of selected node
				if(config.drawLinks) {
				var selLinks = root.selectAll('.link')
					.data(linksData)
					.filter(function(dn) {return dn.source == d})
					.attr("stroke-width", 1)
					.attr("stroke-opacity", function(dn) {return dn.alpha*config.alphaVec})
					.attr("stroke", function(dn){return dn.color.dcolor;})
					.classed('link', true);
				}
               
                //Data for update arcs
                var selectedValues = [];
                config.dimensions.forEach(function(dB, iB){
			         selectedValues[iB] = +d[dB];
                });  
				
			//	var testando1 = d.State;
				selected.text(d.Name);
				
				//Update bars
				bars.data(selectedValues)
					.transition(300)
					.attr("width", function(d){return Math.abs(d)*config.infoPanelWidth;});
                
                //Update arcs
                arcsOut.data(selectedValues)
                    .transition()
                    .duration(300)
                    .style("fill", function(d){return arcColor(Math.abs(d));})
                    .attrTween("d", arc2Tween);       
				
				if (d.Name != config.identifierName)
					regularRadviz.hoverAttribute(d.Name);
				
				// update rank bars
				
			/*	rankbars.data(data.sort(function(a, b) {return Math.abs(+b[Class]) - Math.abs(+a[Class]);}))
					.transition(300)
					.attr("width", function(d){return Math.abs(d[Class])*config.infoPanelWidth;})
					.style("fill", function(d){				//Switches color by linear or nearest
				if (config.colorMode)
					return d.linearColor;
				else				
					return d.nearestColor;				
				});
				
				//update text of rank bars
				
				textSubs.data(data)
					.text(function (d,i){return d.Name;});*/
				
            }) 
            .on('mouseout', function(d) {
                if(config.useTooltip) {
                    tooltip.hide();
                }
				//d.attr("r",function(d){return d.size+0.2;})
            //    events.dotLeave(d);
            //    this.classList.remove('active');
			
				d3.select(this).attr('fill-opacity',config.elemOpacity);
				
				
				if(config.drawLinks) {
				var nlks = root.selectAll('.link')
					.data(linksData)
					.filter(function(dn) {return dn.source == d})
					.attr("stroke-width", 1)
					.attr("stroke", "silver")
					.attr("stroke-opacity", 0.05);
				}

				
				var selectedValues = [];
				config.dimensions.forEach(function(dB, iB){
			         selectedValues[iB] = 0;
                });
				
				 //Update arcs
                arcsOut.data(selectedValues)
                    .transition()
                    .duration(300)
                    .style("fill", function(d){return arcColor(Math.abs(d));})
                    .attrTween("d", arc2Tween);  
					
				regularRadviz.hoverOutAttribute();
			
            /*     arcsOut.data(config.dimensions)
				 .attr('fill-opacity', 0)
				 .attr("d", arc3);   */
             })
			 .on('click', function(d){
				// events.dotEnter(d);
             //   this.classList.add('active');	
			 
			 if (config.selDimensions.indexOf(d.Name) > -1){		//Already in
				d3.select(this).attr('stroke-width',1.0)
							   .style("stroke", function(d){				//Switches color by linear or nearest
									if (config.colorMode)
										return d3.rgb(d.linearColor).darker(1);
									else				
										return d3.rgb(d.nearestColor).darker(1);			
									});	
				config.selDimensions.splice(config.selDimensions.indexOf(d.Name),1); 		//Removing the element			 
			 }
			 else
			 {
				 d3.select(this).attr('stroke-width',1.5)
								.style("stroke", function(d){				//Switches color by linear or nearest
									if (config.colorMode)
										return d3.rgb(d.linearColor).darker(3);
									else				
										return d3.rgb(d.nearestColor).darker(3);			
									});			
									
				config.selDimensions.push(d.Name);				// Inserting the element				 
			 }
			 //regularRadviz.deleteALL();	
			 nextAtt(config.selDimensions);
			 
			/*	d3.select(this).attr('stroke-opacity',1).style("stroke","black");
				regularRadviz.deleteALL();		// Clear regular radviz				
				config.selDimensions.push(d.Name);
				nextAtt(config.selDimensions);*/
				
				//.filter(function(dn) {return dn.source == d})
				
			 });
			 
			
			function updateColors(mode){
				nodes.style("fill", function(d){				//Switches color by linear or nearest
				if (mode)
					return d.linearColor;
				else				
					return d.nearestColor;				
				});
			}		
			
			//updateColors(false);
		
        var labels = root.selectAll('text.label')
            .data(dimensionNodes)
            .enter().append('text')
            .classed('label', true)
            .attrs({
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
                    return(d.x > panelSize / 2) ? '10px' : '-8px';
                },
                dy: function(d) {
                    return(d.y > panelSize * 0.6) ? '12px' : '-8px';
                }
            })
            .text(function(d) {
                return d.name;
            });

        //ARCs with proportions
       // var vis = d3.select("svg");
        var arc = d3.arc()
            .innerRadius(config.chartRadius-config.arcwidth1/2+config.arcDistance)
            .outerRadius(config.chartRadius+config.arcwidth1/2+config.arcDistance)
            .cornerRadius(2)
            .startAngle(function(d,i){return config.angleTable[i]+Math.PI/2-arcRatio(d)-config.arcMinSize;})
            .endAngle(function(d,i){return config.angleTable[i]+Math.PI/2+arcRatio(d)+config.arcMinSize;});
        
        var arc2 = d3.arc()
            .innerRadius(config.chartRadius-config.arcwidth2/2+config.arcDistance2)
            .outerRadius(config.chartRadius+config.arcwidth2/2+config.arcDistance2)
            .cornerRadius(2)
            .startAngle(function(d,i){return config.angleTable[i]+Math.PI/2-arcRatio(d3.max(config.dbBalance))-config.arcMinSize;})
            .endAngle(function(d,i){return config.angleTable[i]+Math.PI/2+arcRatio(d3.max(config.dbBalance))+config.arcMinSize;});
        
       var arc3 = d3.arc()
            .innerRadius(config.chartRadius-config.arcwidth3/2+config.arcDistance3)
            .outerRadius(config.chartRadius+config.arcwidth3/2+config.arcDistance3)
            .cornerRadius(2)
            .startAngle(function(d,i){return config.angleTable[i]+Math.PI/2-arcRatio2(d)-config.arcRefMinSize;})
            .endAngle(function(d,i){return config.angleTable[i]+Math.PI/2+arcRatio2(d)+config.arcRefMinSize;});
        

        var arcRef = root.selectAll("path")
            .data(dimensionNodes)
            .enter()
            .append("path")
            .attr("class", "arc")
			.attr("id","arcref")
            .attr("d", arc2)
            .style("fill", "rgb(50,50,50)")
            .attr("transform", 'translate('+[config.chartRadius, config.chartRadius] +')')
            .call(drag)
            .on('mouseover', function(d) {
				if (selectedLabel == null){
				Class = d.name;
				d3.selectAll('circle.dot')
					.transition()
					.duration(300)
					.attrs({
					r: function(dn){
						return Math.abs(+dn[d.name])*config.dotSize+config.dotMinSize;},
					});
				d3.selectAll('.link')
					.data(linksData)
					.filter(function(dn) {  //filtering other anchors
						return dn.target == d;})
					.filter(function(dm){	//filtering invisible attibutes
						return d3.select(nodes._groups[0][dm.source.index]).style('visibility') == 'visible';})
					.attr("stroke-width", 1)
					.attr("stroke-opacity", function(dn) {return (dn.alpha*2-0.2)})
					.attr("stroke", function(dn){
						if (dn.value<0)
							return 'rgb(255,100,100)';
						else
							return 'rgb(0,150,0)';
						})
					.classed('link', true);
					
				// update rank bars	
				rankbars
					.data(data.sort(function(a, b){
						/*if (a.Name == config.identifierName)
							return 0;*/
						return Math.abs(+b[Class]) - Math.abs(+a[Class]);}))
					/*.filter(function(dn){
						return dn.Name != config.identifierName;})*/
					.transition(300)
					.attr("width", function(d){return Math.abs(d[Class])*config.infoPanelWidth;})
					.style("fill", function(d){				//Switches color by linear or nearest
				if (config.colorMode)
					return d.linearColor;
				else				
					return d.nearestColor;				
				});
					showWordCloud(data, Class);
				
				}
				

             })
            .on('mouseout', function(d) {
				
				if (selectedLabel == null){
				   Class = 'elemSize';
					d3.selectAll('circle.dot')
					.transition()
					.duration(300)
					.attrs({
					r: function(d){
						return Math.abs(+d[Class])*config.dotSize+config.dotMinSize;},
					});
				d3.selectAll('.link')
						.data(linksData)
						.filter(function(dn) {
							return dn.target == d})
						.attr("stroke-width", 1)
						.attr("stroke-opacity", 0.05)
						.attr("stroke", "silver")
						.classed('link', true);	
				}
				hideWordCloud();
				
				
            })
			.on('click', function(d,i) {
				//d3.selectAll('').classList.remove('active');

				if (selectedLabel == d){   //deselecionar
					selectedLabel = null;
					d3.select(this).attr('stroke-width',0);
					d3.selectAll('circle.dot')
						.transition()
						.duration(300)
						.attrs({
							r: function(d){
								return Math.abs(+d[Class])*config.dotSize+config.dotMinSize;},
						});	

				}else if (selectedLabel == null){
					//this.classList.add('active');
					d3.select(this)
						.attr('stroke-width',2)
						.attr('stroke', function(d){return dimensionsColors[i].dcolor;});

					d3.selectAll('circle.dot')
					.transition()
					.duration(300)
					.attrs({
					r: function(d){
						return Math.abs(+d[Class])*config.dotSize+config.dotMinSize;},
					});					
					selectedLabel = d;					
				};
				
				
				
				//this.classList.add('active');	
				//this.attr('stroke-width',1).attr('stroke', 'rgb(255,0,0)');
				//subtitlesbars.data(labelSet).attr('stroke-width',1).attr('stroke-opacity',1);
				
			})
			// right mouse clicking (multiselect stuff)
			.on("contextmenu", function (d, i) {
				d3.event.preventDefault();
				var currentRank = data.sort(function(a, b){return Math.abs(+b[Class]) - Math.abs(+a[Class]);});
				var tries = 0;
				
				if (config.multiSel+config.selDimensions.length>data.length)
					alert("The selection request exceeds the availability of attributes.");
				else{
					for (var i=0;i<config.multiSel+tries;i++){
						if (config.selDimensions.indexOf(currentRank[i].Name) > -1)		//Already in
							tries++;	 
						 else
						 {
							 d3.selectAll('.dot')
								.filter(function(d){return d.Name==currentRank[i].Name})
								.attr('stroke-width',1.5)
								.style("stroke", function(d){				//Switches color by linear or nearest
									if (config.colorMode)
										return d3.rgb(d.linearColor).darker(3);
									else				
										return d3.rgb(d.nearestColor).darker(3);			
									});			
									
							config.selDimensions.push(currentRank[i].Name);				// Inserting the element				 
						 }
					}
					nextAtt(config.selDimensions);
				}
			});;
        
        // ARC dimensions balance
       var arcD = root.selectAll("path2")
            .data(config.dbBalance)
            .enter()
            .append("path")
            .attr("d", arc)
			.attr("id","arcd")
            .data(dimensionsColors)
            .style("fill", function(d){return d.dcolor;})
            .attr("transform", 'translate('+[config.chartRadius, config.chartRadius] +')')
            .data(dimensionNodes);
			
            
         var arcsOut = root.selectAll("path3")
            .data(dimensionNodes)
            .enter()
            .append("path")
            .attr("class", "arc")
			.attr("id","arcsout")
            //.attr("d", arc3)
            .style("fill", "rgb(50,50,50)")
			.attr("transform", 'translate('+[config.chartRadius, config.chartRadius] +')');
        
        function arc2Tween(d, indx) {
            var interp = d3.interpolate(this._current, d);
            this._current = d;
            return function(t) {
                var tmp = interp(t); 
                return arc3(tmp, indx);
            }
        };
        
        window.updateArcs = function updateArcs(i){
				arcRef.data(dimensionNodes).attr("d",arc2);
				arcD.data(config.dbBalance).attr("d",arc);
			  //  arcsOut.data(dimensionNodes).attr("d", arc3);
				dimensionNodes[i].x = config.chartRadius + Math.cos(config.angleTable[i]) * config.chartRadius * config.zoomFactor;
				dimensionNodes[i].y = config.chartRadius + Math.sin(config.angleTable[i]) * config.chartRadius * config.zoomFactor;
				dimensionNodes[i].fx = config.chartRadius + Math.cos(config.angleTable[i]) * config.chartRadius * config.zoomFactor;
				dimensionNodes[i].fy = config.chartRadius + Math.sin(config.angleTable[i]) * config.chartRadius * config.zoomFactor;
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
						return(d.x > panelSize / 2) ? '10px' : '-8px';
					},
					dy: function(d) {
						return(d.y > panelSize * 0.6) ? '12px' : '-8px';
					}
				})
				.text(function(d) {
					return d.name;
				});
				
				// updateing the nodes positions by restarting the force
			   force.alpha(0.5).restart();

            };

        
        /////////////////////////////////////////////////////////
         
        // Update force
       force.on('tick', function() {
            if(config.drawLinks) {
                links.attrs({
                    x1: function(d) { return d.source.x;},
                    y1: function(d) { return d.source.y;},
                    x2: function(d) { return d.target.x;},
                    y2: function(d) { return d.target.y;}});
            }

            nodes.attrs({ cx: function(d) { return d.x;},
						  cy: function(d) { return d.y;}});
        });
        
        var tooltipContainer = d3.select(config.el)
            .append('div')
            .attrs({
                id: 'radviz-tooltip'
            });
        var tooltip = tooltipComponent(tooltipContainer.node());

        return this;
    };
    
     
    var drag = d3.drag()
        .on("drag", dragmove)
		.on("end", dragEnd)
		.on("start", dragStart);
		

    //grag and drop calcs here    
    function dragmove(d, i){
		
        var x = d3.event.x;
        var y = d3.event.y;
	//	var hx = +d3.select(this).attr("x")+d3.event.dx;
		if (this.localName == 'path') {						// if the user is dragging an arc
			var ang = angle(x, y, (config.size / 2 - config.margin), (config.size / 2 - config.margin));
    // 	  	d3.select(this).attr("transform", "translate(" + x + "," + y + ")");
			config.angleTable[i] = ang;
			window.updateArcs(i);
		} else if (this.localName == 'rect') {				// if the user is dragging the bars
		 	x -= config.infoPanelLeft+50;
            y -= config.infoPanelTop;
			
           // d3.selectAll('rect').attr("transform", function(d,i){return "translate("+x+","+y+")";});
			d3.selectAll('.bar').attr("transform", function(d,i){return "translate("+x+","+y+")";});
		
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
			
			d3.selectAll(".quad")
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
	
	function dragEnd(d, i){	
	
		
		
			d3.selectAll(".quad")
				.attr("x",0)
				.attr("y",0)
				.attr("width", 0)
				.attr("height",0);
				
		if (this.localName == 'circle') {			
			d3.selectAll(".dot")
				.filter(function(dn,i) {
							return dn.x > basequadX && dn.x < basequadX+selquadW && dn.y > basequadY && dn.y < basequadY+selquadH})
				.style("stroke", function(d){				//Switches color by linear or nearest
					config.selDimensions.push(d.Name);
					if (config.colorMode)
						return d3.rgb(d.linearColor).darker(3);
					else				
						return d3.rgb(d.nearestColor).darker(3);			
				})
				.attr('stroke-width',1.5);			
				
				//update the visualization
				nextAtt(config.selDimensions);
		}
		else if (this.localName == 'path'){			
			// removing undesired labels
			var dragRadius = Math.sqrt(d3.mouse(this)[0]*d3.mouse(this)[0]+d3.mouse(this)[1]*d3.mouse(this)[1]);
			//test if the user dragged away
			if (dragRadius>config.chartRadius*1.4){				
				removeLabel(config.dimensions[i]);
				updateRadViz();				
			}			
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
        console.log(theta);
        return theta;
    }

    var addNormalizedValues = function(data) {
        data.forEach(function(d) {
            config.dimensions.forEach(function(dimension) {
                d[dimension] = +d[dimension];
            });
        });

        var normalizationScales = {};
        config.dimensions.forEach(function(dimension) {
            normalizationScales[dimension] = d3.scaleLinear().domain(d3.extent(data.map(function(d, i) {
                return d[dimension];
            }))).range([0, 1]);
        });

        data.forEach(function(d) {
            config.dimensions.forEach(function(dimension) {
                d[dimension + '_normalized'] = normalizationScales[dimension](d[dimension]);
            });
        });

        return data;
    };
	
		function updateColors(mode){
			config.colorMode = !mode;
			if (mode){
				d3.selectAll('.dot').style("fill", function(d,i){return d.nearestColor;})
									.style("stroke", function(d){return d3.rgb(d.nearestColor).darker(1);});
				
			}
			else{
				d3.selectAll('.dot').style("fill", function(d,i){return d.linearColor;})
									.style("stroke", function(d){return d3.rgb(d.linearColor).darker(1);});
			
			}
		};	
		
		
		function setBarsVisible(mode){
			if (mode)
				d3.selectAll('.bar').attr("visibility", "visible");
			else
				d3.selectAll('.bar').attr("visibility", "hidden");
		};
		
		function setBorderVisible(mode){
			if (mode)
				d3.selectAll('.dot').style("stroke-opacity", 1);
			else
				d3.selectAll('.dot').style("stroke-opacity", 0);
		};
		
		function resizeElements(newsize){
			config.dotSize = newsize;
			var circles = d3.selectAll('.dot').attr("r", function(d){return Math.abs(d['elemSize'])*config.dotSize+config.dotMinSize;});			
		};
		
		function setTransparency(opacityValue){
			config.elemOpacity = opacityValue;
			d3.selectAll('.dot').attr('fill-opacity', config.elemOpacity);
		};	
		
		function highlightElem(eName){
			d3.selectAll('.dot').transition(300).attr('fill-opacity',0.1);
			d3.selectAll('.dot')
			.filter(function(dn) {
						return dn.Name == eName})
			.transition(300)
			.attr('fill-opacity',config.elemOpacity);			
		};

		function undoHighlight(){
			d3.selectAll('.dot').transition(300).attr('fill-opacity', config.elemOpacity);
		};	
		
		// remove a selected atribute
		function removeAttr(attrToRemove){
			var ouxe = config.selDimensions.indexOf(attrToRemove);
			if (config.selDimensions.indexOf(attrToRemove) > -1){		//Already in									
				d3.selectAll('.dot')
					.filter(function(dn){return dn.Name == attrToRemove})
					.style("stroke", function(d){				//Switches color by linear or nearest
									if (config.colorMode)
										return d3.rgb(d.linearColor).darker(1);
									else				
										return d3.rgb(d.nearestColor).darker(1);			
									});	
				config.selDimensions.splice(config.selDimensions.indexOf(attrToRemove),1); 		//Removing the element			 
			 }			
		}

		function hideNshow(eName,vis){
			/*	d3.selectAll('.dot')
					.filter(function(dn){return dn.Name == eName})
					.style('visibility', this.visibility = (this.visibility == "hidden" ? "visible" : "hidden"));	*/
				d3.selectAll('.dot')
					.filter(function(dn){return dn.Name == eName})
					.style('visibility', this.visibility = (vis == "black" ? "visible" : "hidden"));
			
		};
		
		function hideIDAttr(eName){
				d3.selectAll('.dot')
					.style('visibility', "visible")
					.filter(function(dn){return dn.Name == eName})
					.style('visibility', "hidden");
			
		};
		
		function removeItem(eName){
				config.identifierName = eName;
				d3.selectAll('.dot')
					.filter(function(dn){return dn.Name == eName})
					.remove();
			
		};
		
		function changeForce(val){
			config.collideRatio = val;
			force.force("collide",d3.forceCollide( function(d){
					return (d.elemSize*config.dotSize+config.dotMinSize)*config.collideRatio;}).iterations(1));
			force.alpha(.5).restart();			
		};
		
		function changeStrength(newStrength){
			config.forceStrength = newStrength;
			force.force("link", d3.forceLink(linksData).strength( function(d) { 
					return Math.pow(d.alpha+0.01,newStrength); }));
			force.alpha(.5).restart();
		};
		
		function multiSelect(num){
			config.multiSel = num;
		}
	
		
	
    var exports = {
        config: setConfig,
        render: render,
		updateColors: updateColors,
		setBarsVisible: setBarsVisible,
		resizeElements: resizeElements,
		setTransparency: setTransparency,
		setBorderVisible: setBorderVisible,
		highlightElem: highlightElem,
		undoHighlight: undoHighlight,
		removeAttr: removeAttr,
		removeItem: removeItem,
		changeForce: changeForce,
		changeStrength: changeStrength,
		multiSelect: multiSelect,
		hideIDAttr: hideIDAttr,
		hideNshow: hideNshow
    };

    //d3.rebind(exports, events, 'on');

    return exports;
};
