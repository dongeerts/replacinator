import { copyFile, lstat, mkdir, readFile, rm } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const projectRoot = fileURLToPath(new URL("../", import.meta.url));

const extensionFiles = [
  "manifest.json",
  "popup.html",
  "popup.css",
  "popup.js",
  "static/icons/icon16.png",
  "static/icons/icon32.png",
  "static/icons/icon48.png",
  "static/icons/icon128.png",
];

export async function build(root = projectRoot) {
  const manifest = JSON.parse(await readFile(join(root, "manifest.json"), "utf8"));
  if (typeof manifest.version !== "string" || !/^\d+(?:\.\d+){0,3}$/.test(manifest.version)) {
    throw new Error("manifest.json must contain a numeric extension version.");
  }

  for (const file of extensionFiles) {
    if (!(await lstat(join(root, file))).isFile()) {
      throw new Error(`Build input must be a regular file, not a symlink: ${file}`);
    }
  }

  const directory = join(root, "dist", "extension");
  await rm(directory, { recursive: true, force: true });
  for (const file of extensionFiles) {
    const destination = join(directory, file);
    await mkdir(dirname(destination), { recursive: true });
    await copyFile(join(root, file), destination);
  }
  return { directory, version: manifest.version };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const { directory } = await build();
    console.log(`Production build: ${directory}`);
  } catch (error) {
    console.error(`Build failed: ${error.message}`);
    process.exitCode = 1;
  }
}
