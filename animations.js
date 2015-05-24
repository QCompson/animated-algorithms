//---------------------------animation functions----------------


//Animating a node search
function animateSearch(id) {

	//Selects node with given id and animates it scaling up and down
	var inputValue = document.getElementById("inNum").value;
	d3.select("#" + id)
		.transition()
		.duration(1000)
		.attr("r", globj.radius + globj.dr)
		.each("end", function(d) {

			d3.select(this)
				.transition()
				.delay(function(d) {
					if (Number(inputValue) == Number(d.value)) {
						if (globj.mode == 'i')
							return 0;
						return 1000;
					}
					return 0;
				})
				.duration(500)
				.attr("r", globj.radius)
				.each("end", function(d) {
					if (Number(inputValue) != Number(d.value) || globj.mode == 'i')
						nextSearchNode(id)
				})
		})
}


//Animating a node insertion
function animateInsertNode(parentID) {


	//Animating root insertion
	//Insertion CASE 1
	var inputValue = document.getElementById("inNum").value;
	if (!parentID) {
		tempData = {
			"id": "n1",
			"value": inputValue,
			"color": "black",
			"children": []
		};
		globj.root = tempData;
		update(globj.root);
	}
	//Animating a node insertion 
	else {

		//Adding a new node in the data 
		d3.select("#" + parentID)
			.property("children", function(d) {
				var child = null;
				if (!d.children) {
					//Time to do the rotations
					child = {
						"id": "n" + String(++globj.id),
						"value": inputValue,
						"color": "red",
						"children": []
					}
					d.children = [child];

				} else {
					//Time to do the rotation
					child = {
						"id": "n" + String(++globj.id),
						"value": inputValue,
						"color": "red",
						"children": []
					}
					
					d.children.push(child);
				}
				console.log("Inserting child with id:" + globj.id);
				update(globj.root);
				insert_case1(d3.select("#" + child.id).datum(), d);
			});
	}
}

// Toggle children on click.
function click(d) {
	if (d.children) {
		d._children = d.children;
		d.children = null;
	} else {
		d.children = d._children;
		d._children = null;
	}
	update(d);
}

//Animate openning all the tree nodes
function openAllNodes(id) {
	//Starting with the root
	console.log("Dobio sam id: " + id);
	id = typeof id !== 'undefined' ? id : "n1";

	var allID = []
	allID.push(id);

	while (allID.length > 0) {
		d3.select("#" + allID[0])
			.property("children", function(d) {
				if (d._children) click(d);
				if (d.children) {
					for (var i = 0; i < d.children.length; i++) {
						allID.push(d.children[i].id);
					}
				}
			});

		allID.shift();
	}
}