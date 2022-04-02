// Copyright (c) 2022, Mark Sikora
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright notice,
//       this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
// AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
// ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
// LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
// SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
// CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
// ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE.

import path from 'path';

import { DosboxCompiler } from './dosbox';

export class DosboxBccCompiler extends DosboxCompiler {
    static get key() { return 'dosbox-bcc'; }

    constructor(compilerInfo, env) {
        super(compilerInfo, env);

        // No output option for ASM so these need to be the same
        this.compileFilename = `EXAMPLE${this.lang.extensions[0]}`;
        this.outputFilebase = 'EXAMPLE';
    }

    optionsForFilter(filters, outputFilename) {
        if (filters.binary) {
            return [
                '-o', path.basename(outputFilename),
            ];
        } else {
            return [
                '-S', '-y',
            ];
        }
    }

    getOutputFilename(dirPath, outputFilebase, key) {
        let filename;
        if (key && key.backendOptions && key.backendOptions.customOutputFilename) {
            filename = key.backendOptions.customOutputFilename;
        } else {
            filename = `${outputFilebase}.ASM`;
        }

        if (dirPath) {
            return path.join(dirPath, filename);
        } else {
            return filename;
        }
    }

}
