var dvc = {};


if (Modernizr.inlinesvg) {
$(document).ready(function(){	

	d3.select("#graphic").remove();
	  
	pymChild = new pym.Child();
	  
	var dvc ={};//global namespace
	dvc.curr = "jsa";
	getParams();
	
	
	
	/* Load both the starting SVGs */	
	/* Load SVG for the right */  	

	/* Load SVG for the left */ 
	
	d3.select("#left")
		.append("svg")
		.attr("id","svgElement");

	d3.select("#right")
		.append("svg")
		.attr("id","svgElement2");
	
	
	//url = "assets/PCONmerge2.json";
	var aspectheight = 2;
	var aspectwidth = 1;
	
	width = $('#left').width();
	
	contentwidth = $('#content').width();
	
	if(width>=330) {
		var scale = 3300
		var rotate = [2.7, 1]} 
	else {
		var scale = 2300
		var rotate = [3,1.5];
	};
	
	height = 550;
		
	var svgL = d3.select("#svgElement")
		.attr("width", width)
		.attr("height", height);
		
	var svgR = d3.select("#svgElement2")
		.attr("width", width)
		.attr("height", height);
	
		
	var projectionA = d3.geo.albers()
    .center([0, 55.4])
    .rotate([3.2, 1])
    .parallels([50, 60])
    .scale(scale)
    .translate([width / 2, height / 2]);
	
	var projectionB = d3.geo.albers()
    .center([0, 55.4])
    .rotate(rotate)
    .parallels([50, 60])
    .scale(scale)
    .translate([width / 2, height / 2]);
	
	var pathA = d3.geo.path()
		.projection(projectionA);
		
	var pathB = d3.geo.path()
		.projection(projectionB);
	
		
	function getParams() {

		  firstbit = window.location.href.split(".html")[0];
		
		  var url = decodeURI(window.location.hash);
		
		  if(url != "") {		
				params = url.split("&");
				dvc.curr = params[0].split("=")[1];	
		  }
	}
	
	function updateHash(curr) {
	
		  window.location.hash = encodeURI("selected=" + curr);
			
	}

	
	queue()
		.defer(d3.json, "assets/PCONhex.json")
		.defer(d3.json, "assets/PCONreg.json")
		.defer(d3.csv, "assets/data.csv")
		.defer(d3.json, "assets/config.json")
		.await(ready);
		
	
	function ready(error, pconhex, pconregular, datacsv, config) {
	  
	 navigation(config, datacsv);
	  
	 rateById = {};
	
	datacsv.forEach(function(d) { rateById[d.PCON14CD] = +eval("d." + dvc.curr); });
	  
	var values =  datacsv.map(function(d) { return +eval("d." + dvc.curr); }).filter(function(d) {return !isNaN(d)}).sort(d3.ascending);
			
	//Get the jenks breaks	
	breaks = ss.jenks(values, 5);
	key(breaks);
	
	var newbreaks = breaks.slice(1,5);
	//make sure that the top range break is greater than the max value
	
	newbreaks.push((d3.max(values)+1));
	
	 color = d3.scale.threshold()
		.domain(newbreaks)
		.range(['rgb(241,238,246)','rgb(189,201,225)','rgb(116,169,207)','rgb(43,140,190)','rgb(4,90,141)']);
	
		
		  
	svgL.append("g")
		  .attr("class", "pcon")
		  .selectAll("path")
		  .data(topojson.feature(pconregular, pconregular.objects.PCONreg).features)
		  .enter()
		  .append("path")
		  .attr("id",function(d){return "reg" + d.properties.PCON14CD})
		  .attr("data-nm",function(d){return d.properties.PCON14NM})
		  .style("fill", "#fff")	
		  .attr("d", pathB)
		  .attr("pointer-events","none")
		  .on("mouseout", unhighlight)
		  .on("mouseover", function(d){highlight(d.properties.PCON14CD)});


	if(contentwidth>=768) {
		desktop(pconhex, pconregular, datacsv);  
	}
	else {
		mobile(pconhex, pconregular, datacsv);
	};	
	
	
	}


// Insert functions that work on mobile / desktop only.



function desktop(pconhex, pconregular, datacsv){



	svgR.append("g")
		  .attr("class", "pconhex hide")
		  .selectAll("path")
		  .data(topojson.feature(pconhex, pconhex.objects.PCONmerc).features, function(d) { return d.properties.PCON14CD; })
		  .enter()
		  .append("path")
		  .attr("id",function(d){return "hex" + d.properties.PCON14CD})
		  .attr("d", pathA)
		  .attr("pointer-events","none")
		  .style("fill", function(d) {return color(rateById[d.properties.PCON14CD]); });
		  
		var zoom = d3.behavior.zoom()
    		.on("zoom",function() {
     	   d3.select(".pcon").attr("transform","translate("+ 
            d3.event.translate.join(",")+")scale("+d3.event.scale+")");
		   d3.select(".pconhex2").attr("transform","translate("+ 
            d3.event.translate.join(",")+")scale("+d3.event.scale+")");
	       d3.select(".pcon").selectAll("path")  
            .attr("d", pathB); 
		   d3.select(".pconhex").selectAll("path")  
            .attr("d", pathA); 
		});

		svgL.call(zoom);
		svgR.call(zoom);	


	d3.select("#regS14000051").attr("transform","translate(50,130)");
		  
	//Build an object for each path
	
	var pathReg = {};
	var pathHex = {};
	

	
	d3.select(".pconhex").selectAll("path").each(function(d,i){pathHex[d.properties.PCON14CD] = d3.select("#hex"+ d.properties.PCON14CD).attr("d")});
	pconreg = d3.select(".pcon").selectAll("path");
	
	pconreg.each(function(d,i){pathReg[d.properties.PCON14CD] = d3.select("#reg"+ d.properties.PCON14CD).attr("d")})
		.transition()
		.delay(2500)
		.duration(1500)
		//.style("stroke","#fff")
	    .style("fill", function(d) {if (typeof(color(rateById[d.properties.PCON14CD])) != "undefined") { return color(rateById[d.properties.PCON14CD]); }else {return "red"}});
	
	setTimeout(function(){pconreg.attr("pointer-events","all")},2500)

  
		  
	svgR.append("g")
		  .attr("class", "pconhex2")
		  .selectAll("path")
		  .data(topojson.feature(pconregular, pconregular.objects.PCONreg).features, function(d) { return d.properties.PCON14CD; })
		  .enter()
		  .append("path")
		  .attr("id",function(d){return d.properties.PCON14CD})
		  .attr("d", function(d) {return pathReg[d.properties.PCON14CD]; })
		  .attr("data-nm",function(d){return d.properties.REALNAME})
		  .style("fill", "#fff")
		  .attr("pointer-events","none")
		  .on("mouseout", unhighlight)
		  .on("mouseover", function(d){highlight(d.properties.PCON14CD)});

 	pconhex = d3.select(".pconhex2")
	  	  .selectAll("path");

	pconhex.each(function(d){
		
				var newPath = pathHex[d.properties.PCON14CD];
				var origPath = d3.select(this).attr("d");		
				d3.select(this).call(transition, origPath, newPath);
	});
	
	setTimeout(function(){pconhex.attr("pointer-events","all")},2500)
		
	}
	
	
	function mobile(pconhex, pconregular, datacsv){
		  
		var zoom = d3.behavior.zoom()
    		.on("zoom",function() {
     	   d3.select(".pcon").attr("transform","translate("+ 
            d3.event.translate.join(",")+")scale("+d3.event.scale+")");
	       d3.select(".pcon").selectAll("path")  
            .attr("d", pathB); 
		});

		svgL.call(zoom);


	d3.select("#regS14000051").attr("transform","translate(50,130)");
	
	
	pconreg = d3.select(".pcon")
		.selectAll("path")
		.transition()
		.delay(2500)
		.duration(1500)  
		.style("fill", function(d) {if (typeof(color(rateById[d.properties.PCON14CD])) != "undefined") { return color(rateById[d.properties.PCON14CD]); }else {return "red"}});
	//Build an object for each path
	
	var pathReg = {};	
			
	}

	function navigation(data, datacsv){

		//Build pills
		
			dvc.varname = data.ons.varname;
			dvc.varunit = data.ons.varunit;
			
			var a = dvc.varname.indexOf(dvc.curr);
			dvc.unittext = dvc.varunit[a];

	
			var pills = d3.select("#pills")//.append("nav").attr("class","container-fluid")
					.append("ul")
					.attr("class","nav navbar nav-pills navbar-inverse nav-justified")
					
		
			pills.selectAll("li")
				.data(data.ons.varlabel)
				.enter()
				.append("li")
				.attr("id", function(d,i){return data.ons.varname[i]})
				.append("a")
				.attr("href","#")
				.attr("data-nm", function(d,i){return data.ons.varname[i]})
				.attr("data-toggle","pill")
				.text(function(d,i){return d;})
				.on("click", function(d,i){
					dvc.curr = d3.select(this).attr("data-nm");
					updateMap(data, dvc.curr,datacsv);
					updateHash(dvc.curr);
					var a = dvc.varname.indexOf(dvc.curr);
					dvc.unittext = dvc.varunit[a];
				});
				
		
			d3.select("#" + dvc.curr).attr("class","active");
			
			 var highest = null;

			   $(".nav-pills a").each(function(){  //find the height of your highest link
				   var h = $(this).height();
				   if(h > highest){
					  highest = $(this).height();  
				   }    
				});
			
			   $(".nav-pills a").height(highest);  //set all your links to that height.
		
				
		//Build dropdown
		
		var drop = d3.select("#menu")
					.append("ul")
					.attr("class","nav navbar-nav navbar-right")
					.append("li")
					.attr("class","dropdown");
					
			drop.append("a")
					.attr("href","#")
					.attr("class","dropdown-toggle")
					.attr("data-toggle", "dropdown")
					.text("Select data")
					.append("span")
					.attr("class","caret");
					
			dropnext = drop.append("ul")
					.attr("class","dropdown-menu")
					.attr("role","menu");
					
			dropnext.selectAll("li")
					.data(data.ons.varlabel)
					.enter()
					.append("li")
					.attr("id", function(d,i){return "drop" + data.ons.varname[i]})
					.append("a")
					.attr("href","#")
					.attr("data-nm", function(d,i){return data.ons.varname[i]})
					.text(function(d,i){return d;})
					.on("click", function(d,i){
						dvc.curr = d3.select(this).attr("data-nm");
						updateMap(data, dvc.curr, datacsv);
						updateHash(dvc.curr);
						var a = dvc.varname.indexOf(dvc.curr);
						dvc.unittext = dvc.varunit[a];
			
			dropnext.selectAll("li").attr("class","")
			d3.select("#drop" + dvc.curr).attr("class","active");
					});
			
			d3.select("#drop" + dvc.curr).attr("class","active");
			
			var areacodes =  datacsv.map(function(d) { return d.PCON14CD; });
			var areanames =  datacsv.map(function(d) { return d.PCON_Name; });
				var menuarea = d3.zip(areanames,areacodes).sort(function(a, b){ return d3.ascending(a[0], b[0]); });
			
			// Build option menu for occupations
			var optns = d3.select("#chosensel").append("div").attr("id","sel").append("select")
				.attr("id","occselect")
				.attr("style","width:90%")
				.attr("class","chosen-select");
			
			
			optns.append("option")
				.attr("value","first")
				.text("Choose an area");
			
			optns.selectAll("p").data(menuarea).enter().append("option")
				.attr("value", function(d){ return d[1]}) 
				.text(function(d){ return d[0]});
			
			
			$('#occselect').chosen({width: "90%", allow_single_deselect: true, placeholder_text_single:"Choose an area"}).on('change',function(evt,params){
		
								if(typeof params != 'undefined') {
									
										
										/* identify the data-nm attribute of the polygon you've hovered over */
										myId=params.selected;
										
										highlight(myId);
										
										//$("#"+ myId).attr("fill","green");
										
										d3.select(".pconhex2").selectAll("path").attr("pointer-events","none");
										d3.select(".pcon").selectAll("path").attr("pointer-events","none");

										//updateHash();
								}
								else {
										// Remove any selections
										myId=null;
										unhighlight();
										d3.select(".pconhex2").selectAll("path").attr("pointer-events","all");
										d3.select(".pcon").selectAll("path").attr("pointer-events","all");

								}
								
			});

				
				
		if (pymChild) {
        	pymChild.sendHeight();
  		}
		
	}
	
	function updateMap(data, curr, datacsv){
		
		rateById = {};
		
		datacsv.forEach(function(d) { rateById[d.PCON14CD] = +eval("d." + curr); });
		  
		console.log(rateById);
		
		var values =  datacsv.map(function(d) { return +eval("d." + curr); }).filter(function(d) {return !isNaN(d)}).sort(d3.ascending);

		//Get the jenks breaks	
		breaks = ss.jenks(values, 5);
		
		key(breaks);
		
		var newbreaks = breaks.slice(1,5);
		//make sure that the top range break is greater than the max value
		newbreaks.push((d3.max(values)+1));
		
		color = d3.scale.threshold()
			.domain(newbreaks)
			.range(['rgb(241,238,246)','rgb(189,201,225)','rgb(116,169,207)','rgb(43,140,190)','rgb(4,90,141)']);
		
		unhighlight();
		console.log(d3.select(".pcon").selectAll("path"));
		d3.select(".pcon").selectAll("path")
		 .transition()
		 .duration(1500)
	     .style("fill", function(d) {if(typeof(color(rateById[d.properties.PCON14CD])) != "undefined") { return color(rateById[d.properties.PCON14CD]);} else {return "red"}});	
			 
		if(contentwidth>=768){
		d3.select(".pconhex2").selectAll("path")
		 .transition()
		 .duration(1500)
	     .style("fill", function(d) {if (typeof(color(rateById[d.properties.PCON14CD])) != "undefined") { return color(rateById[d.properties.PCON14CD]); }else {return "red"}});
		 
		}
		 
		 if(typeof myId == 'string'){
		 highlight(myId);
		 }
	
	}
			
		
	function transition(path, d0, d1) {

		path.transition()
	  	  .delay(1000)
		  .duration(1500)
		  .attrTween("d", pathTween(d1, 5));
		  
		  
		path.transition()
	  	  .delay(2500)
		  .duration(1500)	
		  //.style("stroke","#fff")	  
	    .style("fill", function(d) {if (typeof(color(rateById[d.properties.PCON14CD])) != "undefined") { return color(rateById[d.properties.PCON14CD]); }else {return "red"}});	}
	
	
	
	function pathTween(d1, precision) {

	  return function() {
		var path0 = this,
			path1 = path0.cloneNode(),
			n0 = path0.getTotalLength(),
			n1 = (path1.setAttribute("d", d1), path1).getTotalLength();
	
		// Uniform sampling of distance based on specified precision.
		var distances = [0], i = 0, dt = precision / Math.max(n0, n1);
		while ((i += dt) < 1) distances.push(i);
		distances.push(1);
	
		// Compute point-interpolators at each distance.
		var points = distances.map(function(t) {
		  var p0 = path0.getPointAtLength(t * n0),
			  p1 = path1.getPointAtLength(t * n1);
		  return d3.interpolate([p0.x, p0.y], [p1.x, p1.y]);
		});
	
		return function(t) {
		  return t < 1 ? "M" + points.map(function(p) { return p(t); }).join("L") : d1;
		};
	  };
	}


	function highlight(area){
		
	/* get the id of the the equivalent polygons for either side */
		var reg=document.getElementById("reg" + area);
		var hex=document.getElementById("hex" + area);
			
			
	/* Display name of area*/
		var name = d3.select("#reg" + area).attr("data-nm");
		//dvc.varname = data.ons.varname;
		//dvc.varunit = data.ons.varunit;
		
		d3.select("#reg" + area).call(function(d,i){d3.select("#areainfo").text(d.age)});
		d3.select("#areanm").text(name);
		d3.select("#areainfo").html(rateById[area] + "<span>" + dvc.unittext + "</span>")
			
		
	/* select the parent element for all paths for each map (left and right)*/
		svg = d3.select('.pcon');
		svg1 = d3.select('.pconhex2');
		
			
				svg.append("path")
				  .attr("d", d3.select(reg).attr("d"))
				  .attr("id","selected")
				  .attr("class", "arcSelection")
				  .attr("pointer-events", "none")
				  .style("fill", "none")
				  .style("stroke", "orange")
				  .style("stroke-width", 2);
				
				if(area =="S14000051") {console.log(d3.select("#sel")); d3.select("#selected").attr("transform","translate(50,130)")}
				  
				 svg1.append("path")
				  .attr("d", d3.select(hex).attr("d"))
				  .attr("class", "arcSelection")
				  .attr("pointer-events", "none")
				  .style("fill", "none")
				  .style("stroke", "orange")
				  .style("stroke-width", 2); 
				 
				 var fill = d3.select("#reg" + area).style("fill");
				 var value = rateById[area]; 
				  
				 keyvalue(fill, value);
			
	}	
	
	function unhighlight(){
		
		d3.selectAll(".arcSelection").remove();
		d3.select("#keybar").transition().duration(2000).attr("height",0).attr("y", function() {return y(0)});	
		d3.select("#areanm").text("");
		d3.select("#areainfo").html("")

	}	
	
	


	function key(breaks){

		var svgkey = d3.select("#key1")
			.selectAll("svg")
			.data([breaks])
			.enter()
			.append("svg")
			.attr("id", "key")
		    .attr("height", 500)
		    .attr("width", 95);
		
		newbreaks = breaks;
		newbreaks[0] = 0;
	
		
		
		var color = d3.scale.threshold()
		   .domain(newbreaks)
 		   //.domain([0, 20, 40, 60, 80, 100])
 		   .range(['rgb(241,238,246)','rgb(189,201,225)','rgb(116,169,207)','rgb(43,140,190)','rgb(4,90,141)']);

		y = d3.scale.linear()
		    .domain([0, breaks[5]]) /*range for data*/
		    .range([400, 0]); /*range for pixels*/

		var yAxis = d3.svg.axis()
		    .scale(y)
		    .orient("left")
    		.tickSize(15)
		    .tickValues(color.domain());

		var g = svgkey.append("g")
			.attr("transform", "translate(60,40)");
		
		keyg = d3.select("#key").select("g");
		
		g.selectAll("rect")
			.data(color.range().map(function(d, i) {
			  return {
				y0: i ? y(color.domain()[i]) : y.range()[0],
				y1: i < color.domain().length ? y(color.domain()[i+1]) : y.range()[1],
				z: d
			  };
			}))
			.enter().append("rect")
			.attr("width", 8)
			.attr("y", function(d) {return d.y1; })
			.attr("height", function(d) {return d.y0 - d.y1; })
			.style("fill", function(d) {return d.z; });
			
		keyg.selectAll("rect")
			.data(color.range().map(function(d, i) {
			  return {
				y0: i ? y(color.domain()[i]) : y.range()[0],
				y1: i < color.domain().length ? y(color.domain()[i+1]) : y.range()[1],
				z: d
			  };
			}))
			.attr("y", function(d) {return d.y1; })
			.attr("height", function(d) {return d.y0 - d.y1; })
			.style("fill", function(d) { return d.z; });
		
		keyg.call(yAxis).append("text")
			.attr("id", "caption")
			.attr("x", -63)
			.attr("y", -20)
			.text("");

		keyg.append("rect")
			.attr("id","keybar")
			.attr("width",8)
			.attr("height",0)
			.attr("transform","translate(15,0)")
			.style("fill", "#ccc")
			.attr("y",y(0));
			
		}
		
		function keyvalue(fill, value) {
					
			d3.select("#keybar")
				.transition()
				.duration(500)
				.attr("height", function(){return y(0) - y(value)})
				.attr("y", function() {return y(value)})
				.style("fill",fill);
			
		}	
		

        });

    setTimeout(function(){if (pymChild) {pymChild.sendHeight()}},5000);

} 	else  // from modernizer
	
	{
		$("#ieMsg").fadeIn(1000);
		
	}
