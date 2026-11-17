// Publishes every public workspace package whose current version is not in GitHub Packages yet.
// Order: dependencies first. Used by .github/workflows/release.yml; locally: GITHUB_TOKEN=… node scripts/publish-new.mjs
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const ORDER = ['arteries-protocol', 'arteries-core'];
const yarn = (args, opts = {}) => execFileSync('yarn', args, { encoding: 'utf8', ...opts });

let published = 0;
for (const dir of ORDER) {
  const pkg = JSON.parse(readFileSync(`packages/${dir}/package.json`, 'utf8'));
  if (pkg.private) continue;
  const spec = `${pkg.name}@${pkg.version}`;
  let exists = false;
  try {
    yarn(['npm', 'info', spec, '--fields', 'version', '--json'], { stdio: 'pipe' });
    exists = true;
  } catch {
    exists = false; // 404: this version was never published
  }
  if (exists) {
    console.log(`= ${spec} already published`);
    continue;
  }
  console.log(`↑ publishing ${spec}`);
  yarn(['workspace', pkg.name, 'npm', 'publish'], { stdio: 'inherit' });
  published++;
}
console.log(published ? `${published} package(s) published` : 'nothing new to publish');
