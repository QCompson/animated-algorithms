//					GOOD TO KNOW
//
//  d3.select(id) ->   vraca Array[Array[SVG_circle_object]]
// thisNode.select(function() { return this.parentNode; }).datum() -> vraca roditelja kao SVG_obj



//JSON object with the data
var treeData = {
// 	"id": "n1",
// 	"value": "10",
// 	"color": "black",
// 	"children": [{

// 		"id": "n3",
// 		"value": "15",
// 		"color": "black",
// 		"children": [{
// 			"id": "n4",
// 			"value": "12",
// 			"color": "black",
// 			"children": [{
// 				"id": "n5",
// 				"value": "14",
// 				"color": "red",
// 				"children": []
// 			}, {
// 				"id": "n6",
// 				"value": "11",
// 				"color": "red",
// 				"children": []
// 			}]
// 		}]
// 	}, {
// 		"id": "n2",
// 		"value": "2",
// 		"color": "red",
// 		"children": [{
// 			"id": "n7",
// 			"value": "1",
// 			"color": "red",
// 			"children": []
// 		}]
// 	}]
};


//Global things
var tempData = {};

var globj = {
	"nodes": null,
	"root": null,
	"lastID": null,
	"mode": null,
	"radius": 15,
	"dr": 5,
	"id": 1
};



// ************** Generate the tree diagram  *****************
var margin = {
		top: 20,
		right: 120,
		bottom: 20,
		left: 120
	},
	width = 960 - margin.right - margin.left,
	height = 500 - margin.top - margin.bottom;

var i = 0,
	duration = 750;


// Create a svg canvas
var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", 300)
	.append("g")
	.attr("id", "nodeContainer")
	.attr("transform", "translate(40, 40)"); // shift everything to the right

// Create a tree "canvas"
var tree = d3.layout.tree()
	.size([width, height])
	.children(function(d) {
		//Accesing children property from main tree data
		return d.children;
	});


//Creating a diagonal for links
var diagonal = d3.svg.diagonal()
	// change x and y (for the left to right tree)
	.projection(function(d) {
		return [d.x, d.y];
	});


//Calling the start function for tree creation if there is a treeData
if (treeData.id) {

	tempData = treeData;
	globj.root = tempData;
	globj.root.x0 = 0;
	globj.root.y0 = 0;
	globj.id = 7;
	update(globj.root);

}
else {
	globj.root = tempData;
}


//--------------------------------Update function---------------------

function update(source) {

	// Compute the new tree layout.
	var nodes = tree.nodes(globj.root);
	globj.nodes = nodes;
	var links = tree.links(nodes);
	var treeHeight = getHeightOfTree() + 1;


	// Normalize for fixed-depth and arange nodes depending on tree height

	nodes.forEach(function(d) {
		d.y = d.depth * 60;

		if (d.parent) {
			//If leaf
			if ((d.depth + 1) == treeHeight) {
				if (Number(d.value) > Number(d.parent.value))
					d.x = d.parent.x + (2 * globj.radius);
				else
					d.x = d.parent.x - (2 * globj.radius);
			} else {
				//Put the child on right
				if (Number(d.value) > Number(d.parent.value))
					d.x = d.parent.x + ((2 * globj.radius) * Math.pow(2, treeHeight)) / (Math.pow(2, d.depth + 1));
				else
					d.x = d.parent.x - ((2 * globj.radius) * Math.pow(2, treeHeight)) / (Math.pow(2, d.depth + 1));
			}

		}
	});



	// Update the node
	var node = svg.selectAll("g.node")
		.data(nodes, function(d) {
			return d.id;
		});

	// Enter any new nodes at the parent's previous position.
	var nodeEnter = node.enter().append("g")
		.attr("class", "node")
		.attr("transform", function(d) {
			source.x0 = source.x0 != undefined ? source.x0 : 0;
			source.y0 = source.y0 != undefined ? source.y0 : 0;
			console.log("This is source.x0: " +source.x0 + " and this is source.y0: " + source.y0);
			return "translate(" + source.x0 + "," + source.y0 + ")";
		})
		.on("click", click);

	nodeEnter.append("circle")
		.attr("id", function(d) {
			return d.id;
		})
		.attr("r", globj.radius)
		.style("fill", function(d) {
			return d.color;
		});

	nodeEnter.append("svg:text")
		.attr("x", function(d) {
			return node.select("circle").attr("cx");
		})
		.attr("y", function(d) {
			return node.select("circle").attr("cy") + 5;
		})
		.attr("text-anchor", "middle")
		.attr("pointer-events", "none")
		.text(function(d) {
			return d.value;
		})
		.style("fill", "white");

	// Transition nodes to their new position.
	var nodeUpdate = node.transition()
		.duration(duration)
		.attr("transform", function(d) {
			return "translate(" + d.x + "," + d.y + ")";
		});

	nodeUpdate.select("circle")
		.attr("r", globj.radius)
		.attr("id", function(d) {
			return d.id;
		})
		.style("fill", function(d) {
			return d.color;
		});


	//Some extra effects
	node.select("circle").on("mouseover", function() {
		d3.select(this)
			.transition()
			.duration(500)
			.attr("r", globj.radius + globj.dr);
	})

	node.select("circle").on("mouseout", function() {
		d3.select(this)
			.transition()
			.duration(500)
			.attr("r", globj.radius);
	})


	// Transition exiting nodes to the parent's new position.
	var nodeExit = node.exit().transition()
		.duration(duration)
		.attr("transform", function(d) {
			return "translate(" + source.x + "," + source.y + ")";
		})
		.remove();

	nodeExit.select("circle")
		.attr("r", globj.radius);

	nodeExit.select("text")
		.style("fill-opacity", "white");

	// Update the links…
	var link = svg.selectAll("path.link")
		.data(links, function(d) {
			return d.target.id;
		});

	// Enter any new links at the parent's previous position.
	link.enter().insert("path", "g")
		.attr("class", "link")
		.attr("d", function(d) {
			var o = {
				x: source.x0,
				y: source.y0
			};
			return diagonal({
				source: o,
				target: o
			});
		});

	// Transition links to their new position.
	link.transition()
		.duration(duration)
		.attr("d", diagonal);

	// Transition exiting nodes to the parent's new position.
	link.exit().transition()
		.duration(duration)
		.attr("d", function(d) {
			var o = {
				x: source.x,
				y: source.y
			};
			return diagonal({
				source: o,
				target: o
			});
		})
		.remove();

	// Stash the old positions for transition.
	nodes.forEach(function(d) {
		d.x0 = d.x;
		d.y0 = d.y;
	});

	// console.log(treeData);
	// console.log(globj.nodes);

}



//--------------------------------Searching---------------------------

function searchNode() {
	globj.mode = "s";
	animateSearch("n1");
}


//Searches for the next node after node with prevID
function nextSearchNode(prevID) {
	var inputValue = document.getElementById("inNum").value;
	d3.select("#" + prevID)
		.property("children", function(d) {

			if (Number(inputValue) > Number(d.value)) {
				var temp = getRightChild(prevID)
				if (temp)
					animateSearch(temp.id);
				//A node may be inserted
				else {
					if (globj.mode == 's')
						alert("Node " + inputValue + " does not exist")
					else if (globj.mode == 'i')
					// console.log("I can insert it");
						animateInsertNode(prevID);
				}
			} else if (Number(inputValue) < Number(d.value) || globj.mode == 'i') {
				var temp = getLeftChild(prevID)
				if (temp)
					animateSearch(temp.id);
				//A node may be inserted
				else {
					if (globj.mode == 's')
						alert("Node " + inputValue + " does not exist")
					else if (globj.mode == 'i')
					// console.log("I can insert it");
						animateInsertNode(prevID);
				}
			}
		});

}

//--------------------------------Insertion----------------------------

//Animating node insertion
function insertNode() {

	globj.mode = "i";

	//There is no tree yet. You are inserting a root
	if (globj.root.id == null) {
		animateInsertNode(null);
	}
	//A tree exists, find where to insert the node
	else {
		animateSearch("n1");
	}
}


//Rotating a subtree left
function leftRotate(id, callback) {

	var id = id != undefined ? id : document.getElementById("inNum").value;


	var parent = getParent(id);
	var grandParent = getParent(parent.id);
	var leftUncle = getLeftChild(parent.id);

	var thisNode = getRightChild(parent.id);
	var leftChild = getLeftChild(id);
	var rightChild = getRightChild(id);

	console.log(thisNode);


	//Remove parent from grandParent and setting current node as grandParent's child

	//------TODO: make it work if parent is root node----------------

	if ((grandParent !== null)) {
		if (grandParent.children[0].id === parent.id) {
			grandParent.children[0] = thisNode;
			thisNode.parent = grandParent;
		} else {
			grandParent.children[1] = thisNode;
			thisNode.parent = grandParent;
		}
	}
	else
		thisNode.parent = null;

	//Adding the current node's left child (If it exists) as parent's right child
	if (leftChild !== null) {
		if (parent.children[0].id === thisNode.id) {
			parent.children[0] = leftChild;
			leftChild.parent = parent;
		} else {
			parent.children[1] = leftChild;
			leftChild.parent = parent;
		}
	} else {
		if (parent.children[0].id === thisNode.id)
			parent.children.shift();
		else parent.children.pop();
	}

	//Removing current node's left child and setting the parent as the left child
	//No children
	if (!thisNode.children) {
		thisNode.children = []
		thisNode.children.push(parent);
		parent.parent = thisNode;
	}
	//Has a left child - replace it
	else if (leftChild !== null) {
		if (thisNode.children[0].id === leftChild.id) {
			thisNode.children[0] = parent;
			parent.parent = thisNode;
		} else {
			thisNode.children[1] = parent;
			parent.parent = thisNode;
		}
	}
	//Has only right child - push parent inside
	else {
		thisNode.children.push(parent);
		parent.parent = thisNode;
	}

	if (grandParent === null) {
		console.log("Izmjena roota");
		globj.root = thisNode;
	}
	update(globj.root);

	if (callback != undefined)
		callback();

}

//Rotating a subtree right
function rightRotate(id, callback) {
	
	var id = id != undefined ? id : document.getElementById("inNum").value;

	var parent = getParent(id);
	var grandParent = getParent(parent.id);
	var rightUncle = getRightChild(parent.id);

	var thisNode = getLeftChild(parent.id);
	var leftChild = getLeftChild(id);
	var rightChild = getRightChild(id);


	console.log("thisNode: " + thisNode.id);
	console.log("parent: " + parent.id);
	console.log("grandParent: " + grandParent);

	//Remove parent from grandParent and setting current node as grandParent's child
	if ((grandParent !== null)) {
		if (grandParent.children[0].id === parent.id) {
			grandParent.children[0] = thisNode;
			thisNode.parent = grandParent;
		} else {
			grandParent.children[1] = thisNode;
			thisNode.parent = grandParent;
		}
	}
	else
		thisNode.parent = null;


	//Adding the current node's right child (if it exists) as parent's left child
	if (rightChild !== null) {
		if (parent.children[0].id === thisNode.id) {
			parent.children[0] = rightChild;
			rightChild.parent = parent;
		} else {
			parent.children[1] = rightChild;
			rightChild.parent = parent;
		}

	} else {
		if (parent.children[0].id === thisNode.id)
			parent.children.shift();
		else parent.children.pop();
	}

	//Removing current node's right child and setting the parent as the right child
	//Has no children
	if (!thisNode.children) {
		thisNode.children = [];
		thisNode.children.push(parent);
		parent.parent = thisNode;
	}
	//Has a right child
	else if (rightChild !== null) {
		if (thisNode.children[0].id === rightChild.id) {
			thisNode.children[0] = parent;
			parent.parent = thisNode;

		} else {
			thisNode.children[1] = parent;
			parent.parent = thisNode;
		}
	}
	//Has only a left child
	else {
		thisNode.children.push(parent);
		parent.parent = thisNode;
	}
	if (grandParent === null) {
		console.log("Izmjena roota");
		globj.root = thisNode;
	}
	update(globj.root);

	if(callback != undefined)
		callback();
}	



//Animating a node removal
function removeNode() {

}