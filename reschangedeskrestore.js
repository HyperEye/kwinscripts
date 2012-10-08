var clientMap = new Object();

function initialize() {
  var clients = workspace.clientList();

  for(var i in clients) {
    addClient(clients[i]);
  }
}

function addClient(client) {
  print("Adding new client: ", client.caption);
  updateClientMap(client);
  client.clientFinishUserMovedResized.connect(updateClientMap);
}

function removeClient(client) {
  var clientId = client.windowId;
   
  if(clientMap[clientId]) {
    print("Deleting client: ", client.caption);
    delete clientMap[clientId];
  }
}

function screenResizedHandler(screen) {
  print("Screen resized (", workspace.displayWidth, ", ", workspace.displayHeight, ")");
  
  var clients = workspace.clientList();
  
  for(var i in clients) {
    var ret = restoreClientGeometry(clients[i]);
    
    if(!ret) {
      updateClientMap(clients[i]);
    }
  }
}

function numScreensChangedHandler(count) {
  print("Number of screens changed ", count);
 
  //var json = JSON.stringify(clientMap, null, 4);
  //print("client Map: ", json);
  
  var clients = workspace.clientList();
  
  for(var i in clients) {   
    var ret = restoreClientGeometry(clients[i]);
    
    if(!ret) {
      updateClientMap(clients[i]);
    }
  }
}

function updateClientMap(client) {
  var clientId   = client.windowId;
  var rectMapKey = new String();

  for(i = 0; i < workspace.numScreens; ++i) {
    var clArea = workspace.clientArea(KWin.FullScreenArea, i, 0);
    rectMapKey += clArea['width'].toString() + clArea['height'].toString();
  }
  
  if(!clientMap[clientId]) {
    clientMap[clientId] = new Object();
  }

  if(clientMap[clientId][rectMapKey]) {
    delete clientMap[clientId][rectMapKey];
  }
  
  print("Storing geometry for client ", client.caption, "[", client.windowId, "] with key ", rectMapKey);
  
  clientMap[clientId][rectMapKey] = new Object();
  
  // Store each geometry parameter
  for(var attr in client.geometry) {
    clientMap[clientId][rectMapKey][attr] = client.geometry[attr];
  }

  // For easier debugging
  clientMap[clientId]['caption'] = client.caption;
}

function restoreClientGeometry(client) {
  var clientId   = client.windowId;
  var rectMapKey = new String();
  
  for(i = 0; i < workspace.numScreens; ++i) {
    var clArea = workspace.clientArea(KWin.FullScreenArea, i, 0);
    rectMapKey += clArea['width'].toString() + clArea['height'].toString();
  }
  
  if(clientMap[clientId][rectMapKey]) {
    client.geometry = clientMap[clientId][rectMapKey];

    print("Moved client ", client.caption, " to ", client.geometry['x'], ", Intended: ", clientMap[clientId][rectMapKey]['x']);
    
    return true;
  }
  
  return false;
}

initialize();

workspace.screenResized.connect(screenResizedHandler);
workspace.numberScreensChanged.connect(numScreensChangedHandler);
workspace.clientAdded.connect(addClient);
workspace.clientRemoved.connect(removeClient);
