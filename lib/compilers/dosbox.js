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
import w32path from 'path/win32';

import fs from 'fs-extra';

import { BaseCompiler } from '../base-compiler';
import * as exec from '../exec';
import { logger } from '../logger';

export class DosboxCompiler extends BaseCompiler {
    static get key() { return 'dosbox'; }

    getExecutableFilename(dirPath, outputFilebase) {
        return this.getOutputFilename(dirPath, outputFilebase) + '.EXE';
    }

    filename(fn) {
        return path.basename(fn).toUpperCase();
    }

    async exec(compiler, args, options) {
        const cmd = path.basename(compiler);

        const bin_path = path.dirname(compiler);
        const install_path = path.dirname(bin_path);
        const root = path.dirname(install_path);

        var tmp;
        if ('customCwd' in options && options.customCwd !== '.') {
            tmp = options.customCwd;
        } else {
            tmp = await this.newTempDir();
        }

        const dos_path = w32path.join('C:', path.basename(install_path), path.basename(bin_path));

        var all_args = [cmd];
        all_args.push(...args);

        const dos_cmd = all_args.join(' ');

        var buf = '';
        // Use 4DOS shell for redirections
        buf += '[config]\n';
        buf += 'SHELL=4DOS.COM\n';
        buf += '[cpu]\n';
        buf += 'cycles=max\n';
        buf += '[autoexec]\n';
        // Mount compiler and tmp directories
        buf += `MOUNT C ${root}\n`;
        buf += `MOUNT D ${tmp}\n`;
        // Make sure everything is avaiable on path
        buf += `SET PATH=%PATH%;${dos_path}\n`;
        // Cd to tmp
        buf += 'D:\n';
        // Run cmd, capture output and status
        buf += `${dos_cmd} > OUT.TXT >&> ERR.TXT\n`;
        buf += 'ECHO %ERRORLEVEL > STATUS.TXT\n';

        const conf_file = path.join(tmp, 'dosbox.conf');
        await fs.outputFile(conf_file, buf);

        var result = await exec.execute('dosbox-x', ['-silent', '-conf', conf_file], options);

        result.stderr    = fs.readFileSync(path.join(tmp, 'ERR.TXT'), 'utf8');
        result.stdout    = fs.readFileSync(path.join(tmp, 'OUT.TXT'), 'utf8');
        result.code      = parseInt(fs.readFileSync(path.join(tmp, 'STATUS.TXT'), 'utf8'));

        return result;
    }
}
