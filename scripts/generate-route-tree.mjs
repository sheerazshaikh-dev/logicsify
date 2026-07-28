import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const routesDir = path.join(root, 'src', 'routes');
const out = path.join(root, 'src', 'routeTree.gen.ts');

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function pascalToken(token) {
  if (token === '$slug') return 'Slug';
  if (token === 'index') return 'Index';
  return token
    .replace(/\.[^.]+$/, '')
    .split(/[-_.]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

const routes = walk(routesDir)
  .filter((file) => file.endsWith('.tsx'))
  .filter((file) => !file.endsWith(`${path.sep}__root.tsx`))
  .map((file) => {
    const source = fs.readFileSync(file, 'utf8');
    const match = source.match(/createFileRoute\((['"])(.*?)\1\)/s);
    if (!match) throw new Error(`No createFileRoute path found in ${file}`);
    const routePath = match[2];
    const relative = path.relative(path.join(root, 'src'), file).replace(/\\/g, '/').replace(/\.tsx$/, '');
    const importPath = `./${relative}`;
    const routeRelative = path.relative(routesDir, file).replace(/\\/g, '/').replace(/\.tsx$/, '');
    const name = routeRelative.split('/').map(pascalToken).join('') + 'Route';
    const importName = `${name}Import`;
    const toPath = routePath !== '/' && routePath.endsWith('/') ? routePath.slice(0, -1) : routePath;
    return { file, routePath, toPath, importPath, name, importName };
  })
  .sort((a, b) => {
    if (a.routePath === '/') return -1;
    if (b.routePath === '/') return 1;
    return a.routePath.localeCompare(b.routePath);
  });

const q = (value) => `'${value.replaceAll("'", "\\'")}'`;
const lines = [];
lines.push('/* eslint-disable */', '', '// @ts-nocheck', '', '// Generated from src/routes. Do not edit manually.', '');
lines.push("import { Route as rootRouteImport } from './routes/__root'");
for (const route of routes) lines.push(`import { Route as ${route.importName} } from ${q(route.importPath)}`);
lines.push('');
for (const route of routes) {
  lines.push(`const ${route.name} = ${route.importName}.update({`);
  lines.push(`  id: ${q(route.routePath)},`);
  lines.push(`  path: ${q(route.routePath)},`);
  lines.push('  getParentRoute: () => rootRouteImport,');
  lines.push('} as any)', '');
}

const interfaceMap = (name, key, value) => {
  lines.push(`export interface ${name} {`);
  for (const route of routes) lines.push(`  ${q(route[key])}: typeof ${route[value]}`);
  lines.push('}', '');
};
interfaceMap('FileRoutesByFullPath', 'routePath', 'name');
interfaceMap('FileRoutesByTo', 'toPath', 'name');
lines.push('export interface FileRoutesById {', '  __root__: typeof rootRouteImport');
for (const route of routes) lines.push(`  ${q(route.routePath)}: typeof ${route.name}`);
lines.push('}', '');

const union = (values, indent = '    ') => values.map((v, index) => `${indent}${index === 0 ? '' : '| '}${q(v)}`).join('\n');
lines.push('export interface FileRouteTypes {');
lines.push('  fileRoutesByFullPath: FileRoutesByFullPath');
lines.push('  fullPaths:');
lines.push(union(routes.map((r) => r.routePath)));
lines.push('  fileRoutesByTo: FileRoutesByTo');
lines.push('  to:');
lines.push(union(routes.map((r) => r.toPath)));
lines.push('  id:');
lines.push(union(['__root__', ...routes.map((r) => r.routePath)]));
lines.push('  fileRoutesById: FileRoutesById');
lines.push('}', '');

lines.push('export interface RootRouteChildren {');
for (const route of routes) lines.push(`  ${route.name}: typeof ${route.name}`);
lines.push('}', '');

lines.push("declare module '@tanstack/react-router' {");
lines.push('  interface FileRoutesByPath {');
for (const route of routes) {
  lines.push(`    ${q(route.routePath)}: {`);
  lines.push(`      id: ${q(route.routePath)}`);
  lines.push(`      path: ${q(route.toPath)}`);
  lines.push(`      fullPath: ${q(route.routePath)}`);
  lines.push(`      preLoaderRoute: typeof ${route.importName}`);
  lines.push('      parentRoute: typeof rootRouteImport');
  lines.push('    }');
}
lines.push('  }', '}', '');

lines.push('const rootRouteChildren: RootRouteChildren = {');
for (const route of routes) lines.push(`  ${route.name},`);
lines.push('}', '');
lines.push('export const routeTree = rootRouteImport');
lines.push('  ._addFileChildren(rootRouteChildren)');
lines.push('  ._addFileTypes<FileRouteTypes>()', '');

fs.writeFileSync(out, lines.join('\n'));
console.log(`Generated ${path.relative(root, out)} with ${routes.length} routes.`);
