const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

let clock = Date.now();
let enableLog = false;
let logTime = 5000;
let logData = [];
let prevData;
app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

let clients = 0; //Count the number of users connected to the server
let userArray = [];
let planeArray = [];
let meshArray = [];
let roomState = {
  stl: true,
  wireframe: false,
  gcode: false,
  extrude: false,
  travel: false,
  support: true,
  tree: false,
  layer: false,
  toggleLayer: false,
  toggleBoat: true,
  hideRoom: false,
  togglePrinter: false,
  togglePhysics: false,
  scale: 1,
  rotation: 0,
  boat: true,
  overhang: false,
  owl: false
};
////////////////////////
// Socket Connection //
//////////////////////

io.sockets.on("connection", (socket) => {
  clients += 1; //Add one client to the server count

  //To client who just connected
  //socket.emit("mySocketID", socket.id); //Sends socket.id to client as mySocketID
  //socket.emit("userArrayFromServer", userArray); //Server sends userArray to client who just connected

  //Adds new user to server after existing userArray has been sent to client
  socket.userData = {
    id: socket.id,
    color: 0,
    presenting: 0,
    ar: 0,
    vr: 0,
    xr: 0,
    controllerNum: 0,
    con1: 0,
    con2: 0,
    posX: 0,
    posY: 0,
    posZ: 0,
  }; //Default values;
  let oldUserArray = userArray;
  addToUserArray(socket.userData);
  console.log("The userArray now has " + userArray.length + " objects");
  //To all other existing clients
  socket.emit("addNewUser", socket.userData); //Sends information back to the client who is connecting
  socket.broadcast.emit("addNewUser", socket.userData); //Sends new client information to all other clients

  socket.emit("addOtherUsers", oldUserArray); //Sends information back to the client who is already connected
  //socket.emit("roomState", roomState);

  //Send server clock to the new client
  var timeNow = Date.now() - clock;
  socket.emit("serverTime", timeNow);

  //Log Information to the Server Console
  connectionLog(socket.id, clients); //Logs new connection to the server console
  timeLog(); //Logs the amount of time the server has been running

  if (planeArray.length > 0) {
    for (let i = 0; i < planeArray.length; i++) {
      socket.emit("addPlaneToClient", planeArray[i]);
    }
  }
  if (meshArray.length > 0) {
    for (let i = 0; i < meshArray.length; i++) {
      socket.emit("addMesh-detectedFromServer", meshArray[i]);
    }
  }

  ////////////////////////
  // Socket disconnect //
  //////////////////////

  socket.on("disconnect", function () {
    clients -= 1;
    userArray = userArray.filter((e) => e !== socket.id);
    //socket.broadcast.emit("isPresentingArrayFilter", socket.id);
    var newArray = [];
    var con1 = "controller1";
    var con2 = "controller2";
    var data = socket.id;
    var dataCon1 = data.concat(con1);
    var dataCon2 = data.concat(con2);
    console.log(data);
    console.log(dataCon1);
    console.log(dataCon2);
    for (let i = 0; i < userArray.length; i++) {
      if (
        userArray[i].id !== data &&
        userArray[i].id !== dataCon1 &&
        userArray[i].id !== dataCon2
      ) {
        newArray.push(userArray[i]);
      } else if (userArray[i].id !== data) {
        // newArray.push(isPresentingArray[i]);
      }
    }
    userArray = newArray;

    console.log(
      `${socket.id} disconnected. There are ` + clients + " users online."
    );
    console.log(userArray);
    socket.broadcast.emit("deleteUser", socket.id);
  });

  ////////////////////////////////
  // Other custom socket calls //
  //////////////////////////////

  socket.on("addControllerToServer", function (data) {
    socket.broadcast.emit("addControllerToClient", data);
    addToUserArray(data);
    console.log("Controller " + data.id + " has entered XR.");
    console.log(userArray.length);
  });

  socket.on("addCubeToServer", function (data) {
    socket.broadcast.emit("addCubeToClient", data);
    let i = getIndexByID(data); //calls custom function
    userArray[i] = data;
    console.log("Client " + data.id + " has entered XR.");
    console.log(userArray.length);
  });

  socket.on("addPlane", function (data) {
    socket.broadcast.emit("addPlaneToClient", data);
    //planeArray.push(data);
  });

  socket.on("ballShot", function (data) {
    socket.broadcast.emit("ballsFromServer", data);
    if (enableLog) {
      let emit = "ballsFromServer";
      logSocket(data, emit);
    }
  });

  socket.on("debug", function (data) {
    console.log("debug");
    console.log(data);
    socket.broadcast.emit("debugFromServer", data);
  });

  socket.on("requestRoomState", function () {
    
    //Disabled due to bugs
    //socket.emit("roomState", roomState);
  });

  socket.on("requestUserArrayFromServer", function () {
    //console.log(userArray);
    socket.emit("sendUserArrayToClient", userArray);
  });
  socket.on("requestUserArrayFromServerDebug", function () {
    socket.emit("sendUserArrayToClientDebug", userArray);
  });
  socket.on("stoppedPresenting", function (data) {
    console.log("Client " + data + " stoppedPresenting");
    socket.broadcast.emit("stoppedPresentingUserArray", data);
    socket.emit("stoppedPresentingUserArray", data);

    // Change presenting value to 0

    var newArray = [];
    var con1 = "controller1";
    var con2 = "controller2";
    var dataCon1 = data.concat(con1);
    var dataCon2 = data.concat(con2);
    for (let i = 0; i < userArray.length; i++) {
      if (
        userArray[i].id == data ||
        userArray[i].id == dataCon1 ||
        userArray[i].id == dataCon2
      ) {
        userArray[i].presenting = 0;
      }
    }

    //Remove controllers from the userArray
    userArray = userArray.filter((e) => e !== dataCon1);
    userArray = userArray.filter((e) => e !== dataCon2);
    //socket.broadcast.emit("isPresentingArrayFilter", socket.id);
    newArray = [];
    for (let i = 0; i < userArray.length; i++) {
      if (userArray[i].id !== dataCon1 && userArray[i].id !== dataCon2) {
        newArray.push(userArray[i]);
      } else if (userArray[i].id !== data) {
        // newArray.push(isPresentingArray[i]);
      }
    }
    userArray = newArray;
  });

  socket.on("syncXRSupport", function (data) {
    console.log(data);
    let i = getIndexByID(data); //calls custom function
    userArray[i] = data;
  });

  socket.on("updatePos", function (data) {
    if (enableLog) {
      let dataString = JSON.stringify(data);
      if (prevData !== dataString) {
        //var timeNow = Date.now() - clock;
        let dataToLog =
          Date.now() +
          "," +
          data.id +
          "," +
          data.camPos.x +
          "," +
          data.camPos.y +
          "," +
          data.camPos.z +
          "," +
          data.camQuat +
          "," +
          data.con1Pos.x +
          "," +
          data.con1Pos.y +
          "," +
          data.con1Pos.z +
          "," +
          data.con1Quat +
          "," +
          data.con2Pos.x +
          "," +
          data.con2Pos.y +
          "," +
          data.con2Pos.z +
          "," +
          data.con2Quat +
          "," +
          data.presenting +
          "," +
          data.color +
          "\r\n";
        logData.push(dataToLog);
        prevData = JSON.stringify(data);
      }
    }
        socket.broadcast.emit("updatePosFromServer", data);
  });

  socket.on("addMesh-detected", function (data) {
    socket.broadcast.emit("addMesh-detectedFromServer", data);
    //meshArray.push(data);
  });

  socket.on("coverButtonToServer", function (data) {
    socket.broadcast.emit("coverButtonPressed", data);

    if (enableLog) {
      let emit = "coverButtonPressed";
      logSocket(data, emit, socket.id);
    }
  });

  socket.on("fansButtonToServer", function (data) {
    socket.broadcast.emit("fansButtonPressed", data);

    if (enableLog) {
      let emit = "fansButtonPressed";
      logSocket(data, emit, socket.id);
    }
  });

  socket.on("heatsinkButtonToServer", function (data) {
    socket.broadcast.emit("heatsinkButtonPressed", data);

    if (enableLog) {
      let emit = "heatsinkButtonPressed";
      logSocket(data, emit, socket.id);
    }
  });

  socket.on("stlButtonToServer", function (data) {
    socket.broadcast.emit("stlButtonPressed", data);
    roomState.stl = !roomState.stl;
    if (enableLog) {
      let emit = "stlButtonPressed";
      logSocket(data, emit, socket.id);
    }
  });

  socket.on("wireframeButtonToServer", function (data) {
    socket.broadcast.emit("wireframeButtonPressed", data);
      roomState.wireframe = !roomState.wireframe;
    if (enableLog) {
      let emit = "wireframeButtonPressed";
      logSocket(data, emit, socket.id);
    }
  });

  socket.on("gcodeButtonToServer", function (data) {
    socket.broadcast.emit("gcodeButtonPressed", data);
    roomState.gcode = !roomState.code;
    if (enableLog) {
      let emit = "gcodeButtonPressed";
      logSocket(data, emit, socket.id);
    }
  });

  socket.on("gcodeExtrudeButtonToServer", function (data) {
    socket.broadcast.emit("gcodeExtrudeButtonPressed", data);
        roomState.extrude = !roomState.extrude;
    if (enableLog) {
      let emit = "gcodeExtrudeButtonPressed";
      logSocket(data, emit, socket.id);
    }
  });

  socket.on("gcodeTravelButtonToServer", function (data) {
    socket.broadcast.emit("gcodeTravelButtonPressed", data);
        roomState.travel = !roomState.travel;
    if (enableLog) {
      let emit = "gcodeTravelButtonPressed";
      logSocket(data, emit, socket.id);
    }
  });

  socket.on("gcodeSupportButtonToServer", function (data) {
    socket.broadcast.emit("gcodeSupportButtonPressed", data);
    roomState.support = !roomState.support;

    if (enableLog) {
      let emit = "gcodeSupportButtonPressed";
      logSocket(data, emit, socket.id);
    }
  });

  socket.on("gcodeTreeButtonToServer", function (data) {
    socket.broadcast.emit("gcodeTreeButtonPressed", data);
        roomState.tree = !roomState.tree;
console.log(socket.id);
    if (enableLog) {
      let emit = "gcodeTreeButtonPressed";
      logSocket(data, emit, socket.id);
    }
  });

  socket.on("hideRoomButtonToServer", function (data) {
    socket.broadcast.emit("hideRoomButtonPressed", data);
    roomState.hideroom = !roomState.hideroom;
    if (enableLog) {
      let emit = "hideRoomButtonPressed";
      logSocket(data, emit, socket.id);
    }
  });

  socket.on("rotateBoatToServer", function (data) {
    socket.broadcast.emit("rotateBoat", data);
    if (enableLog) {
      let emit = "rotateBoat";
      logSocket(data, emit, socket.id);
    }
  });

  socket.on("scaleBoatToServer", function (data) {
    socket.broadcast.emit("scaleBoat", data);
    if (enableLog) {
      let emit = "scaleBoat";
      logSocket(data, emit, socket.id);
    }
  });

  socket.on("toggleBoatToServer", function (data) {
    socket.broadcast.emit("toggleBoat", data);
    roomState.boat = !roomState.boat;
    roomState.overhang = false;
    roomState.owl = false;
    if (enableLog) {
      let emit = "toggleBoat";
      logSocket(data, emit, socket.id);
    }
  });

  socket.on("toggleTestToServer", function (data) {
    socket.broadcast.emit("toggleTest", data);
        roomState.boat = false;
    roomState.overhang = !roomState.overhang;
    roomState.owl = false;
    if (enableLog) {
      let emit = "toggleTest";
      logSocket(data, emit, socket.id);
    }
  });

  socket.on("toggleOwlToServer", function (data) {
    socket.broadcast.emit("toggleOwl", data);
        roomState.boat = false;
    roomState.overhang = false;
    roomState.owl = !roomState.owl;
    if (enableLog) {
      let emit = "toggleOwl";
      logSocket(data, emit, socket.id);
    }
  });

  socket.on("togglePrinterToServer", function (data) {
    socket.broadcast.emit("togglePrinter", data);
        roomState.printer = !roomState.printer;
    if (enableLog) {
      let emit = "togglePrinter";
      logSocket(data, emit, socket.id);
    }
  });

  socket.on("togglePrinterOnToServer", function (data) {
    socket.broadcast.emit("togglePrinterOn", data);
    if (enableLog) {
      let emit = "togglePrinterOn";
      logSocket(data, emit, socket.id);
    }
  });

  socket.on("togglePhysicsToServer", function (data) {
    socket.broadcast.emit("togglePhysics", data);
        roomState.physics = !roomState.physics;
    if (enableLog) {
      let emit = "togglePhysics";
      logSocket(data, emit, socket.id);
    }
  });

  socket.on("ender3XAxisGroupToServer", function (data) {
    socket.broadcast.emit("ender3XAxisGroupToClient", data);
    if (enableLog) {
      let emit = "ender3XAxisGroupToClient";
      logSocket(data, emit, socket.id);
    }
  });

  socket.on("ender3YAxisGroupToServer", function (data) {
    socket.broadcast.emit("ender3YAxisGroupToClient", data);
    if (enableLog) {
      let emit = "ender3YAxisGroupToClient";
      logSocket(data, emit, socket.id);
    }
  });

  socket.on("ender3HotEndGroupToServer", function (data) {
    socket.broadcast.emit("ender3HotEndGroupToClient", data);
    if (enableLog) {
      let emit = "ender3HotEndGroupToClient";
      logSocket(data, emit, socket.id);
    }
  });

  socket.on("gcodeLayerPlusActionToServer", function (data) {
    socket.broadcast.emit("gcodeLayerPlusActionToClient", data);
    if (enableLog) {
      let emit = "gcodeLayerPlusActionToClient";
      logSocket(data, emit, socket.id);
    }
  });

  socket.on("gcodeLayerToggleActionToServer", function (data) {
    socket.broadcast.emit("gcodeLayerToggleActionToClient", data);
    if (enableLog) {
      let emit = "gcodeLayerToggleActionToClient";
      logSocket(data, emit, socket.id);
    }
  });

  socket.on("gcodeLayerMinusActionToServer", function (data) {
    socket.broadcast.emit("gcodeLayerMinusActionToClient", data);
    if (enableLog) {
      let emit = "gcodeLayerMinusActionToClient";
      logSocket(data, emit, socket.id);
    }
  });

  socket.on("stopPrintingToServer", function (data) {
    socket.broadcast.emit("stopPrintingToClient", data);
    if (enableLog) {
      let emit = "stopPrintingToClient";
      logSocket(data, emit, socket.id);
    }
  });

  socket.on("pausePrinterToServer", function (data) {
    socket.broadcast.emit("pausePrinterToClient", data);
    if (enableLog) {
      let emit = "pausePrinterToClient";
      logSocket(data, emit, socket.id);
    }
  });

  socket.on("updatePrinterPositionToServer", function (data) {
    socket.broadcast.emit("updatePrinterPositionToClient", data);
    if (enableLog) {
      let emit = "updatePrinterPositionToClient";
      logSocket(data, emit, socket.id);
    }
  });

  socket.on("toggleGuideToServer", function (data) {
    socket.broadcast.emit("toggleGuide", data);
  });
  
    socket.on("pauseGuideToServer", function (data) {
    socket.broadcast.emit("pauseGuide", data);
  });
});

//////////////////////////////////
//  Listen to the socket port  //
////////////////////////////////

server.listen(3000, () => {
  console.log("listening on *:3000");
});

if (enableLog) {
  var fs = require("fs");

  function writelog() {
    var logText = JSON.stringify(logData);
    if (logText !== "[]") {
      logData.forEach((element) =>
        fs.appendFile("log.txt", element, (err) => {
          if (err) throw err;
        })
      );
      logData = [];
      logText = "";
      console.log("Logged");
    } else {
      console.log("No new data to log.");
    }
  }
  setInterval(writelog, logTime);
  const csvHeader =
    "time, id, camPosX, camPosY, camPosZ, camQuatX, camQuatY, camQuatZ, camQuatW, con1PosX,  con1PosY, con1PosZ, con1QuatX, con1QuatY, con1QuatZ,  con1QuatW, con2PosX, con2PosY, con2PosZ, con2QuatX, con2QuatY, con2QuatZ, con2QuatW, presenting, color\r\n";
  fs.appendFile("log.txt", csvHeader, (err) => {
    if (err) throw err;
    console.log("Log started");
  });
}

/////////////////////////
//  Custom functions  //
///////////////////////

function addToUserArray(JSON) {
  userArray.push(JSON);
}

function connectionLog(id, num) {
  if (clients == 1) {
    console.log(`${id} connected. There is ` + num + " client online.");
  } else {
    console.log(`${id} connected. There are ` + num + " clients online.");
  }
}

function disconnectionLog(id, num) {
  if (clients == 1) {
    console.log(`${id} disconnected. There is ` + num + " client online.");
  } else {
    console.log(`${id} disconnected. There are ` + num + " clients online.");
  }
}

function getIndexByID(data) {
  for (let i in userArray) {
    if (userArray[i].id == data.id) {
      return i;
    }
  }
}

function timeLog() {
  console.log(
    "The server has been running for " +
      (Date.now() - clock) / 1000 +
      " seconds."
  );
}

function logSocket(data, emit, id) {
  let dataString = JSON.stringify(data);
  //var timeNow = Date.now() - clock;
  let dataToLog =
    Date.now() +
    "," +
    id +
    "," +
    -999 +
    "," +
    emit +
    "," +
    dataString +
    "\r\n";
  logData.push(dataToLog);
}
