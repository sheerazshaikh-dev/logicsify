import { spawnSync } from "node:child_process";
import path from "node:path";

const viteBin = path.resolve("node_modules/vite/bin/vite.js");
const result = spawnSync(process.execPath, [viteBin, "build"], {
  stdio: "inherit",
  env: {
    ...process.env,
    VITE_API_URL: "http://127.0.0.1:9",
  },
});

if (result.error) throw result.error;
process.exit(result.status ?? 1);
