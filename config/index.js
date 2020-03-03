const fs = require('fs');
const path = require('path');
const mini = require('terser');
const { exec } = require('child_process');
const { Writable } = require('stream');
class QuestalConfig {
    
    constructor(root) {
        
        this.root = root || process.cwd();
        this.toWrite = [];
        this.src = this.root;
        this.stream = null;
       
        this.valid = ['written', 'data'];
        
    }
    
    err(err, out, e) {
        if (err) {
            this.end();    
            console.warn(err);
        }
        if (out) {
            console.log(out);
        }
        if (e) {
            this.end();
            console.warn(e);
        }
    }
    
    callErr() {
        let $this = this;
        return (err, out, e) => { $this.err(err, out, e) };
    }
    
    * generate() {
        let count = 0;
        while(this.toWrite[count]) {
            yield this.toWrite[count];
            count++;
        }
        return null;
    }
    
    
    add(files, src) {
        let $this = this;
        if (typeof files === 'string') {
            files = [files];
        }
        let root = src ? path.resolve(this.root, src) : this.root;
        let f = files.map(file => path.join(root, file + '.js')).filter(file => !$this.toWrite.includes(file));
        if (f && f.length) {
            this.toWrite = this.toWrite.concat(f);
        }
        return this;
    }
    
    min() {
        if (this.stream) {
            let $this = this;
            if (this.stream instanceof Writable) {
                this.stream.on('finish', function() {
                    let min = this.path.replace('.js', '.min.js');
                    fs.readFile(this.path, 'utf-8', (err, file) => {
                        $this.err(err);
                        let mi = mini.minify(file);
                        if (mi.error) {
                            $this.err(mi.error);
                            return;
                        }
                        fs.writeFile(min, mi.code, 'utf-8', $this.callErr());
                    });
                });
            }
            return this;
        }
    }
    
    end() {
        if (this.stream) {
            this.stream.end();
            this.stream = null;
        }
        this.toWrite = [];
        this.result = '';
    }
    

    
    fire(name, ...args) {
        let result = '';
        if (this.valid.includes(name) && this[name].length) {
            this[name].forEach(fn => {
                let res = fn.call(this, ...args);
                if (name == data) {
                    this.result += res;
                }
            }, this);
        }
        return result;
    }
    
    _write(dest, min, msgPath) {
        let $this = this;
        $this.stream = fs.createWriteStream(dest);
        $this.stream = $this.stream;
        $this.stream.on('error', $this.callErr());
        if (min) {
            $this.min($this.stream);
        }
        let gen = $this.generate();
        $this.stream.on('pipe', (read) => {
            read.on('error', (err) => {
                $this.err(err);
                $this.end();
               
            });
            read.on('data', function(data) {
                $this.result += data;
                $this.stream.write(data);
            });
            read.on('end', () => {
                let f = gen.next().value;
                if (f) {
                    fs.createReadStream(f, 'utf-8').pipe($this.stream, { end: false });
                } else {
                    $this.end();
                    let msg = min ? 'Files written to ' + msgPath : 'File path is ' + msgPath;
                    console.info(msg); 
                    if ($this.written) {
                        $this.written.call($this, dest, dir);
                    }
                }
            });
        });
        fs.createReadStream(gen.next().value, 'utf-8').pipe($this.stream, {end: false });
    }
    
    write(dest, dir, min) {
        let $this = this;
        let p = '';
        if (dir) {
            dir = path.resolve(this.root, dir);
            dest = path.resolve(dir, dest + '.js');
            p = min ? dir : dest;
            exec('rm -rf "' + dir + '"', (err, out, errMsg) => {
                $this.err(err, out, errMsg);
                fs.mkdir(dir, () => {
                    $this._write(dest, min, p);
                });
            });
        } else {
            console.log('WHAT????');
            dest = path.resolve(this.root, dest + '.js');
            $this._write(dest, min, dest);
        }
        return this;
    }
}
module.exports = QuestalConfig;

