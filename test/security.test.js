import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tagsViewPath = path.join(__dirname, '../src/views/tags.js');
const linksViewPath = path.join(__dirname, '../src/views/links.js');
const dashboardViewPath = path.join(__dirname, '../src/views/dashboard.js');
const writerViewPath = path.join(__dirname, '../src/views/writer.js');
const securityUtilsPath = path.join(__dirname, '../src/utils/security.js');

function verify() {
  let errors = [];

  // 1. Verify security.js exists
  if (!fs.existsSync(securityUtilsPath)) {
    errors.push('src/utils/security.js does not exist');
  } else {
    const securityContent = fs.readFileSync(securityUtilsPath, 'utf8');
    if (!securityContent.includes('export function escapeHTML')) {
      errors.push('src/utils/security.js does not export escapeHTML');
    }
  }

  const checkFile = (filePath, name) => {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');

      if (!content.includes('import { escapeHTML }') && !content.includes('import { escapeHTML, sanitizeURL }')) {
        errors.push(`${name} does not import escapeHTML`);
      }

      // Check for common vulnerable patterns
      // ${variable} where variable is not wrapped in escapeHTML
      // This is hard to regex perfectly, but we can look for specific variables we know are vulnerable.

      const varsToCheck = ['tag.label', 'tag.serialNumber', 'link.title', 'link.url', 'item.message', 'l.title', 'l.url', 't.label'];

      varsToCheck.forEach(v => {
        // Look for ${\s*v\s*}
        // But ignore if it's inside escapeHTML( ... )
        // We can check if every occurrence of ${v} is preceded by escapeHTML(

        // This is a naive check.
        // We find all indices of ${v}
        // Then check if escapeHTML( is immediately before it (ignoring whitespace).

        const regex = new RegExp(`\\\$\\{\\s*${v.replace('.', '\\.')}\\s*\\}`, 'g');
        let match;
        while ((match = regex.exec(content)) !== null) {
            // Check context
            // If we find exactly ${tag.label}, it's vulnerable unless it's strictly logic (which we know it isn't mostly)
            // But we changed them to ${escapeHTML(tag.label)}.
            // So the regex ${tag.label} should NOT match our new code.

            // Wait, ${escapeHTML(tag.label)} does NOT contain the string "${tag.label}".
            // It contains "${" then "escapeHTML(tag.label)" then "}".
            // So my regex ${ tag.label } matches ONLY if it is DIRECTLY inside the braces.
            // So if the regex matches, it is vulnerable!

            // Exception: logic like ${tag.serialNumber ? ...}
            // In that case, tag.serialNumber is NOT the interpolation result, it's part of the expression.
            // My regex matches ${ tag.serialNumber }.
            // In ${tag.serialNumber ? ...}, the whole expression inside {} is "tag.serialNumber ? ...".
            // So ${ tag.serialNumber } will NOT match "${tag.serialNumber ? ...}".

            // So, simply putting, if I find ${tag.label} literally, it's likely a bug.

            errors.push(`Found unescaped usage of ${v} in ${name}`);
        }
      });

    } else {
      errors.push(`${name} does not exist`);
    }
  };

  checkFile(tagsViewPath, 'src/views/tags.js');
  checkFile(linksViewPath, 'src/views/links.js');
  checkFile(dashboardViewPath, 'src/views/dashboard.js');
  checkFile(writerViewPath, 'src/views/writer.js');

  if (errors.length > 0) {
    console.error('Verification Failed:');
    errors.forEach(e => console.error('- ' + e));
    process.exit(1);
  } else {
    console.log('Verification Passed!');
  }
}

verify();
