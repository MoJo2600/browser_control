import { ChildProcess, spawn } from "child_process";
import * as http from "http";

// A global state to keep track of the current chromium process
let curProcess: ChildProcess | null = null;

function stop() {
  if (curProcess !== null) {
    process.kill(-curProcess.pid);
  }
  curProcess = null;
}

function restart(url: string) {
  stop();
  curProcess = spawn(
    "chromium-browser",
    [
      // This disables the annoying 'chrome is out of date' window
      "--check-for-update-interval=604800",
      "--kiosk",
      "--incognito",
      url,
    ],
    { detached: true }
  );
}

// Not the prettiest HTTP service implementation...
http
  .createServer(function (request, response) {
    function fail(error?: Error) {
      response.writeHead(400, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ success: false, error }));
    }

    function succeed() {
      const result = { success: true };
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify(result), "utf-8");
    }

    if (request.method !== "POST") {
      fail();
    }

    const restartMatch = /\/restart\??(.*)/.exec(request.url!);
    if (restartMatch) {
      const url = unescape(restartMatch[1]);
      restart(url);
      succeed();
    } else {
      fail();
      return;
    }
  })
  .listen(3001);
console.log("Server running at http://127.0.0.1:3001/");
