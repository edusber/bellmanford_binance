/*
Bellman-Ford 

Eduardo Bermudez
//
*/

const binance = require('node-binance-api');
binance.options({
  'APIKEY':'',
  'APISECRET':''
});

var RSVP = require('rsvp');
var math = require('mathjs');

var bin_promise = new RSVP.Promise(function(resolve, reject){

	binance.bookTickers(function(ticker){

		graph = new Graph();

		btc = graph.addNode("BTC");
		eth = graph.addNode("ETH");
		bnb = graph.addNode("BNB");
		usdt = graph.addNode("USDT");
		ltc = graph.addNode("LTC");
		xrp = graph.addNode("XRP");


		//USDT
		eth.addEdge(usdt,-math.log(ticker.ETHUSDT.bid));
		usdt.addEdge(eth,-math.log(1/ticker.ETHUSDT.ask));

		ltc.addEdge(usdt,-math.log(ticker.LTCUSDT.bid));
		usdt.addEdge(ltc,-math.log(1/ticker.LTCUSDT.ask));

		btc.addEdge(usdt,-math.log(ticker.BTCUSDT.bid));
		usdt.addEdge(btc,-math.log(1/ticker.BTCUSDT.ask));

		bnb.addEdge(usdt,-math.log(ticker.BNBUSDT.bid));
		usdt.addEdge(bnb,-math.log(1/ticker.BNBUSDT.ask));


		//ETH
		ltc.addEdge(eth,-math.log(ticker.LTCETH.bid));
		eth.addEdge(ltc,-math.log(1/ticker.LTCUSDT.ask));

		xrp.addEdge(usdt,-math.log(ticker.XRPETH.bid));
		eth.addEdge(xrp,-math.log(1/ticker.XRPETH.ask));

		eth.addEdge(btc,-math.log(ticker.ETHBTC.bid));
		btc.addEdge(eth,-math.log(1/ticker.ETHBTC.ask));

		bnb.addEdge(eth,-math.log(ticker.BNBETH.bid));
		eth.addEdge(bnb,-math.log(1/ticker.BNBETH.ask));


		//LTC
		ltc.addEdge(btc,-math.log(ticker.LTCBTC.bid));
		btc.addEdge(ltc,-math.log(1/ticker.LTCBTC.ask));

		ltc.addEdge(bnb,-math.log(ticker.LTCBNB.bid));
		bnb.addEdge(ltc,-math.log(1/ticker.LTCBNB.ask));


		//BTC
		bnb.addEdge(btc,-math.log(ticker.BNBBTC.bid));
		btc.addEdge(bnb,-math.log(1/ticker.BNBBTC.ask));

		xrp.addEdge(btc,-math.log(ticker.XRPBTC.bid));
		btc.addEdge(xrp,-math.log(1/ticker.XRPBTC.ask));

		//BNB and XRP nodes already accounted for

		resolve(bellman_ford(graph,btc,eth));
		reject("error");
	});
})


bin_promise.then(function(value){
	console.log(value);
}).catch(function(error){
	console.log(error);
});


function Graph(){
	this.isWeighted=false;
	this.nodes=[]
	this.addNode=addNode;
	this.removeNode=removeNode;
	this.nodeExist=nodeExist;
	this.getAllNodes=getAllNodes;
	function addNode(Name){
		temp=new Node(Name);
		this.nodes.push(temp);
		return temp;
	}
	function removeNode(Name){
		
		index=this.nodes.indexOf(Name);
		if(index>-1){
			this.nodes.splice(index,1);
			len=this.nodes.length;

			for (var i = 0; i < len; i++) {
				if(this.nodes[i].adjList.indexOf(Name)>-1){
					this.nodes[i].adjList.slice(this.nodes[i].adjList.indexOf(Name));
					this.nodes[i].weight.slice(this.nodes[i].adjList.indexOf(Name));
				}
			}
		}
		
	}
	function nodeExist(Name){
		index=this.nodes.indexOf(Name);
		if(index>-1){
			return true;
		}
		return false;
	}

	function getAllNodes(){
		return this.nodes;
	}

}

function Node(Name){
	this.name=Name;
	this.adjList=[];
	this.weight=[];
	this.addEdge=addEdge;
	this.compare=compare;
	function addEdge(neighbour,weight){
		this.adjList.push(neighbour);
		this.weight.push(weight);	
	}
	
	function getAdjList(){
		return adjList;
	}
	function compare(node2){
		return this.weight-node2.weight;
	}
}

function bellman_ford(graph,source,destination){
	this.previousNode=[];
	this.distance=new Array();				
	this.distance[source.name]=0;
	var nodes=graph.getAllNodes();
	var loop = [];
	length=nodes.length;
	for(var i=0;i<length;i++){
		if(nodes[i]!=source){
			this.distance[nodes[i].name]=Number.POSITIVE_INFINITY;
		}
	}
	
	for(var k=0;k<length;k++){
		for(var j=0;j<length;j++){
			u=nodes[j];
			adjList=u.adjList;
			for (var i = 0; i < adjList.length; i++) {
				v=adjList[i];
				if(this.distance[u.name]!=Number.POSITIVE_INFINITY){	
					alt=this.distance[u.name]+u.weight[i];
					if(alt<this.distance[v.name]){
						this.previousNode[v.name]=u.name;
						this.distance[v.name]=alt;
					}
				}
			}
		}
	}

	for(var j=0;j<length;j++){
		u=nodes[j];
		adjList=u.adjList;
		for (var i = 0; i < adjList.length; i++) {
			v=adjList[i];
			if(this.distance[u.name]!=Number.POSITIVE_INFINITY){	
				alt=this.distance[u.name]+u.weight[i];
				if(alt<this.distance[v.name]){
					var a = this.previousNode[v.name];
					loop.push(v.name);
					console.log(v.name);
					while (v.name != a) {
						console.log(a);
						loop.push(a);
						a = this.previousNode[a];
					}
					console.log(a);
					loop.push(a);
					//return null;
					return loop;
				}
			}
		}
	}
	
	return this.distance[destination.name];	
}




////// MOMENTUM
/*
pseudo:
while True:
	avg = average(ETH/USDT, past 5 days)
	current = ETH/USDT
	if (current > 1.01 * avg):
		buy 
	else if (current < avg):
		sell 

Questions:
- how often to rebalance
- how often call for ETH/USDT
- N-day moving average - what is N?

rebalance every hour using 24 hour moving average
*/






