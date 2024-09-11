const { readFileSync } = require('fs');
const { URL, pathToFileURL } = require('url');

const extensions = ['.js', '.json'];

function resolve(specifier, context) {
  const { parentURL = null } = context;

  const resolvedURL = new URL(specifier, parentURL);
  const isRelative = specifier.startsWith('./') || specifier.startsWith('../');

  if (isRelative) {
    const extension = extensions.find((ext) => resolvedURL.pathname.endsWith(ext));
    if (extension) {
      return { url: pathToFileURL(resolvedURL.pathname).href };
    }
  }

  throw new Error(`Cannot resolve "${specifier}" from ${parentURL}`);
}

function load(url) {
  const format = url.endsWith('.json') ? 'json' : 'module';
  const source = readFileSync(new URL(url), 'utf-8');

  return { format, source };
}

exports.resolve = resolve;
exports.load = load;