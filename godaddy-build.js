/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");

const originalRename = fs.rename.bind(fs);
const originalRenameSync = fs.renameSync.bind(fs);
const originalPromisesRename = fs.promises.rename.bind(fs.promises);

function isExdev(error) {
  return error && typeof error === "object" && error.code === "EXDEV";
}

function copyThenRemove(source, destination, callback) {
  fs.mkdir(path.dirname(destination), { recursive: true }, (mkdirError) => {
    if (mkdirError) {
      callback(mkdirError);
      return;
    }

    fs.copyFile(source, destination, (copyError) => {
      if (copyError) {
        callback(copyError);
        return;
      }

      fs.unlink(source, callback);
    });
  });
}

fs.rename = function patchedRename(source, destination, callback) {
  originalRename(source, destination, (error) => {
    if (isExdev(error)) {
      copyThenRemove(source, destination, callback);
      return;
    }

    callback(error);
  });
};

fs.renameSync = function patchedRenameSync(source, destination) {
  try {
    originalRenameSync(source, destination);
  } catch (error) {
    if (!isExdev(error)) {
      throw error;
    }

    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(source, destination);
    fs.unlinkSync(source);
  }
};

fs.promises.rename = async function patchedPromisesRename(source, destination) {
  try {
    await originalPromisesRename(source, destination);
  } catch (error) {
    if (!isExdev(error)) {
      throw error;
    }

    await fs.promises.mkdir(path.dirname(destination), { recursive: true });
    await fs.promises.copyFile(source, destination);
    await fs.promises.unlink(source);
  }
};

process.env.NODE_ENV = "production";
process.env.NEXT_TELEMETRY_DISABLED = "1";
process.argv = [process.argv[0], require.resolve("next/dist/bin/next"), "build"];
require("next/dist/bin/next");
