import { build } from 'esbuild';
import fs from 'fs-extra';

export const generateBuild = async () => {
    await fs.remove('./build/static');
    await build({
        entryPoints: ['./src/index.tsx'],
        outdir: './dist/static/js',
        minify: true,
        bundle: true,
        sourcemap: true,
        loader: { '.svg': 'dataurl', '.png': 'dataurl' },
        define: {
            'process.env.REACT_APP_NODE_ENV': "'production'",
            'process.env.REACT_APP_PORT': "8090",
            'process.env.PORT': "8080",
            'process.env.REACT_APP_API_ENDPOINT_URL': "'http://localhost:8080'",
            'process.env.REACT_APP_FRONTEND_URL': "'http://localhost:8090'",
            'process.env.REACT_APP_FORTNOX_SCOPES':
                "'invoice customer order article supplierinvoice connectfile archive inbox bookkeeping companyinformation payment'",
        },
    }).catch(() => process.exit(1));
};

fs.copy('./public/index.html', './dist/index.html');
fs.copy('./public/static', './dist/static');
generateBuild();
