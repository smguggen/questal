const { exec } = require('child_process');

exec('rm -rf ./dist', (err => {
    if (err) {
        console.log(err);
    } else {
        exec('cp -R ../dist .', (err) => {
            if (err) {
                console.log(err);
            }
        })
    }
}));