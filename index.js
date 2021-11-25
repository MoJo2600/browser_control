"use strict";
exports.__esModule = true;
var child_process_1 = require("child_process");
var http = require("http");
// A global state to keep track of the current chromium process
var curProcess = null;
function stop() {
    if (curProcess !== null) {
        process.kill(-curProcess.pid);
    }
    curProcess = null;
}
function restart(url) {
    stop();
    curProcess = (0, child_process_1.spawn)("chromium-browser", [
        // This disables the annoying 'chrome is out of date' window
        "--check-for-update-interval=604800",
        "--kiosk",
        "--incognito",
        url,
    ], { detached: true });
}
// Not the prettiest HTTP service implementation...
http
    .createServer(function (request, response) {
    function fail(error) {
        response.writeHead(400, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ success: false, error: error }));
    }
    function succeed() {
        var result = { success: true };
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify(result), "utf-8");
    }
    if (request.method !== "POST") {
        fail();
    }
    var restartMatch = /\/restart\??(.*)/.exec(request.url);
    if (restartMatch) {
        var url = unescape(restartMatch[1]);
        restart(url);
        succeed();
    }
    else {
        fail();
        return;
    }
})
    .listen(3001);
console.log("Server running at http://127.0.0.1:3001/");
