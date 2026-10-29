const fs = require('fs');
const path = require('path');

const file = 'android/app/build/generated/autolinking/src/main/jni/Android-autolinking.cmake';
if (fs.existsSync(file)) {
    const lines = fs.readFileSync(file, 'utf-8').split('\n');
    for (const line of lines) {
        const match = line.match(/add_subdirectory\s*\(\s*"([^"]+)"\s+([^\s\)]+)\)/);
        if (match) {
            const dir = match[1];
            let name = match[2];
            name = name.replace(/_autolinked_build$/, '');
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            const cmakeFile = path.join(dir, 'CMakeLists.txt');
            if (!fs.existsSync(cmakeFile)) {
                fs.writeFileSync(cmakeFile, `cmake_minimum_required(VERSION 3.13)\nif(NOT TARGET react_codegen_${name})\n  add_library(react_codegen_${name} INTERFACE)\nendif()\n`);
            }
        }
    }
}
