import fs from 'fs-extra';
import chokidar from 'chokidar';
import { generateBuild } from './esbuild';


(async () => {
    await fs.copy('./public/index.html', './dist/index.html');
    await fs.copy('./public/static', './dist/static');
    await generateBuild().then(() => {
        chokidar
            .watch('./src', { ignored: /dist|node_modules|.git/ })
            .on('all', async (event, path) => {
                console.log(event, path);
                await generateBuild().catch((error) => {
                    console.log("%O", error);
                    process.exit(1);
                });
            });
    });
})();
