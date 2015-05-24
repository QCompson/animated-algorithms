//--------------------------------helper functions---------------------

//Return left child data object
function getLeftChild(id) {

	var leftChild = null;
	d3.select("#" + id)
		.property("children", function(d) {
			if (d.children) {
				for (var i = 0; i < d.children.length; i++) {
					if (Number(d.children[i].value) <= Number(d.value))
						leftChild = d.children[i];
				}
			}
		})
	return leftChild;
}

//Returns right child data object
function getRightChild(id) {

	var rightChild = null;
	d3.select("#" + id)
		.property("children", function(d) {
			if (d.children) {
				for (var i = 0; i < d.children.length; i++) {
					if (Number(d.children[i].value) > Number(d.value))
						rightChild = d.children[i];
				}
			}
		})
	return rightChild;
}

//Return parent data object
function getParent(id) {
	
	var parent = null;
	d3.select("#" + id)
		.property("children", function(d) {
			if (d.parent)
				parent = d.parent;
		})
	return parent;
}

//Retutn the uncle data object
function getUncle(id) {

	var grandParent = getParent(getParent(id).id);
	var parent = getParent(id);

	if (grandParent) {
		var leftC = getLeftChild(grandParent.id);
		var rightC = getRightChild(grandParent.id);

		//Both should be available
		if (leftC != null && rightC != null) {

			if (leftC.id == parent.id)
				return rightC;
			else if (rightC.id == parent.id)
				return leftC;
		}
		else return null;
	}
}

function getHeightOfTree() {

	var maxH = 0;
	for (var i = 0; i < globj.nodes.length; i++) {
		if (globj.nodes[i].depth > maxH)
			maxH = globj.nodes[i].depth;
	}
	return maxH;
}



//Searching for a node with an ID
function searchTree(id) {


}

function getLastID() {

}


//-----------------------------INSERTION CASES----------------------------



// CASE1: The current node is at the root of the tree
function insert_case1(n, parent) {
	if (parent == null) {
		n.color = "black";
		update(globj.root);
		console.log("CASE 1");
	}
	else
		insert_case2(n, parent);
}

//CASE2: The current node's parent P is black
function insert_case2(n, parent) {
	if (parent.color == "black"){
		//Everyting is ok
		console.log("CASE 2");
		return;
	}
	else{
		console.log("You can't handle the truth!");
		insert_case3(n, parent);
	}
}

function insert_case3(n, parent) {

	var grandParent = getParent(parent.id);
	var uncle = getUncle(n.id);

	if (uncle != null && (uncle.color == "red")) {
		console.log("CASE 3");

		parent.color = "black";
		uncle.color = "black";
		grandParent.color = "red";
		update(globj.root);
		insert_case1(grandParent, getParent(grandParent.id));
	}
	else {
		console.log("My wife...she's your biggest fan!");
		insert_case4(n, parent);

	}
}

function insert_case4(n, parent) {
	var grandParent = getParent(parent.id);
	if (getRightChild(parent.id) && getLeftChild(grandParent.id)) {
		if ((n.id == getRightChild(parent.id).id) && (parent.id == getLeftChild(grandParent.id).id)) {
			console.log("CASE 4");
			leftRotate(n.id);

			d3.select("#" + n.id)
			.transition()
			.delay(1000)
			.duration(100)
			.attr("r", globj.radius)
			.each("end", function(d) {
				insert_case5(getLeftChild(n.id), n);
			} );
			// WHEN LEFT ROTATE FINNISHES!!!!!! MAKE SURE IT FINNISHES BEFORE CALLING 5
			
		}
	}
	else if (getLeftChild(parent.id) && getRightChild(grandParent.id)) {
		if ((n.id == getLeftChild(parent.id).id) && (parent.id == getRightChild(grandParent.id))) {
			console.log("CASE 4");
			rightRotate(n.id);

			d3.select("#" + n.id)
			.transition()
			.delay(1000)
			.duration(100)
			.attr("r", globj.radius)
			.each("end", function(d) {
				insert_case5(getRightChild(n.id), n);
			} );
			// WHEN RIGHT ROTATE FINNISHES!!!!!! MAKE SURE IT FINNISHES BEFORE CALLING 5
			
		}
	}

	insert_case5(n, parent);
	console.log("You, sir, are the murderer!!!");
	
}

function insert_case5(n, parent) {

	console.log("CASE 5");
	var grandParent = getParent(parent.id);

	parent.color = "black";
	grandParent.color = "red";
	if (getLeftChild(parent.id) != null && n.id == getLeftChild(parent.id).id)
		rightRotate(parent.id);
	else
		leftRotate(parent.id);

}



//---------------------REMOVAL CASES----------------------------
