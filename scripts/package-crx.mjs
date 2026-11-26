import { constants, existsSync } from "node:fs";
import { access, copyFile, cp, mkdtemp, readFile, realpath, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { delimiter, isAbsolute, join, relative, resolve, sep } from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { build, projectRoot } from "./build.mjs";

function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;

  let candidates;
  if (process.platform === "darwin") {
    candidates = [
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Chromium.app/Contents/MacOS/Chromium",
      join(process.env.HOME || "", "Applications/Google Chrome.app/Contents/MacOS/Google Chrome"),
    ];
  } else if (process.platform === "win32") {
    candidates = ["PROGRAMFILES", "PROGRAMFILES(X86)", "LOCALAPPDATA"]
      .filter((name) => process.env[name])
      .map((name) => join(process.env[name], "Google", "Chrome", "Application", "chrome.exe"));
  } else {
    candidates = (process.env.PATH || "").split(delimiter).flatMap((directory) =>
      ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser"]
        .map((name) => join(directory, name)));
  }

  const executable = candidates.find((candidate) => existsSync(candidate));
  if (!executable) {
    throw new Error("Chrome was not found. Set CHROME_PATH to the Chrome or Chromium executable.");
  }
  return executable;
}

export async function packageCrx(root = projectRoot) {
  if (!process.env.CRX_PRIVATE_KEY) {
    throw new Error("Set CRX_PRIVATE_KEY to your existing private .pem key. See CONTRIBUTING.md for first-time key setup.");
  }

  const key = await realpath(resolve(process.env.CRX_PRIVATE_KEY));
  await access(key, constants.R_OK);
  if (!(await stat(key)).isFile()) {
    throw new Error("CRX_PRIVATE_KEY must point to a readable private .pem key file.");
  }
  const keyInBuild = relative(join(await realpath(root), "dist", "extension"), key);
  if (keyInBuild === "" || (!isAbsolute(keyInBuild) && keyInBuild !== ".." && !keyInBuild.startsWith(`..${sep}`))) {
    throw new Error("Move CRX_PRIVATE_KEY outside dist/extension before building; that directory is replaced.");
  }

  const chrome = findChrome();
  const { directory, version } = await build(root);
  const output = join(root, "dist", `replacinator-${version}.crx`);
  const temporary = await mkdtemp(join(tmpdir(), "replacinator-crx-"));
  try {
    const extension = join(temporary, "extension");
    await cp(directory, extension, { recursive: true });
    const result = spawnSync(chrome, [
      "--headless=new",
      "--no-first-run",
      "--no-default-browser-check",
      `--user-data-dir=${join(temporary, "profile")}`,
      `--pack-extension=${extension}`,
      `--pack-extension-key=${key}`,
    ], { encoding: "utf8", timeout: 60_000, windowsHide: true });
    if (result.error) {
      throw new Error(`Could not run Chrome (${chrome}): ${result.error.message}`);
    }
    if (result.status !== 0) {
      throw new Error(`Chrome packaging failed (${result.signal || result.status}): ${result.stderr.trim() || result.stdout.trim()}`);
    }

    const packed = join(temporary, "extension.crx");
    if (!existsSync(packed)) {
      throw new Error(`Chrome did not create a CRX package: ${result.stderr.trim() || result.stdout.trim()}`);
    }
    const contents = await readFile(packed);
    if (contents.length < 12 || contents.toString("ascii", 0, 4) !== "Cr24" || contents.readUInt32LE(4) !== 3) {
      throw new Error("Chrome produced an invalid CRX3 package.");
    }
    await copyFile(packed, output);
    return output;
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    console.log(`Signed CRX package: ${await packageCrx()}`);
  } catch (error) {
    console.error(`CRX packaging failed: ${error.message}`);
    process.exitCode = 1;
  }
}
