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
            const libTarget = `react_codegen_${name}`;
            const existing = fs.existsSync(cmakeFile) ? fs.readFileSync(cmakeFile, 'utf8') : '';
            if (!fs.existsSync(cmakeFile) || existing.includes(`add_library(${libTarget} INTERFACE)`)) {
                fs.writeFileSync(path.join(dir, 'react_codegen_placeholder.cpp'), '// Placeholder for a library without generated JNI code.\n');
                fs.writeFileSync(cmakeFile, `cmake_minimum_required(VERSION 3.13)\nif(NOT TARGET ${libTarget})\n  add_library(${libTarget} STATIC react_codegen_placeholder.cpp)\nendif()\n`);
            }
        }
    }
}
