# bellman-ford binance

implementation of bellman-ford:
- scrape btc/eth/bnb/usdt/ltc/xrp rates from binance
- generate a graph with each token representing a node and each weight to be the negative natural logarithm of the pair's ask price
- identify the minimum distance from each node to all other nodes using bellman-ford
- identify negative cycles (arb opportunities) by relaxing all edges an additional time

to-do:
- implement using multiple exchanges to widen spreads - binance alone not practical
- scrape all rates and variableize graph size
- layer on trading piece if spreads make sense
