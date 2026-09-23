import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const repoRoot = path.resolve(__dirname, '../..');
const dirKbli = path.join(repoRoot, 'docs/kbli');
const dirKbliB = path.join(repoRoot, 'docs/kbli-b');

const targetPortalCatalog = path.resolve(__dirname, '../src/data/kbli-catalog.json');
const targetAsIsCatalog = path.join(repoRoot, 'docs/as-is/ui-submission-alternatif-staging/public/kbli-catalog.json');

function parseKbliFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const result = {
    kbli_code: '',
    title: '',
    scopes: []
  };

  let currentScope = null;
  let currentRequirementObj = null;
  let currentSection = null; // 'requirements', 'obligations', 'parameters', 'authority_levels'

  for (let rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    if (line.includes('kbli_code:')) {
      const match = line.match(/kbli_code:\s*"([^"]+)"/);
      if (match) result.kbli_code = match[1];
    } else if (line.includes('title:') && !currentScope) {
      const match = line.match(/title:\s*"([^"]+)"/);
      if (match) result.title = match[1];
    } else if (line.includes('- sequence:')) {
      const match = line.match(/- sequence:\s*"([^"]+)"/);
      currentScope = {
        sequence: match ? match[1] : 'A',
        title: '',
        licensing_requirements: []
      };
      result.scopes.push(currentScope);
      currentRequirementObj = null;
      currentSection = null;
    } else if (line.includes('title:') && currentScope && !currentRequirementObj) {
      const match = line.match(/title:\s*"([^"]+)"/);
      if (match) currentScope.title = match[1];
    } else if (line.includes('- scale_group:')) {
      currentRequirementObj = {
        business_scale: [],
        risk_code: '',
        risk_level: '',
        perizinan_usaha: [],
        processing_time: 'Otomatis',
        authority: '',
        requirements: [],
        obligations: [],
        parameters: []
      };
      if (currentScope) {
        currentScope.licensing_requirements.push(currentRequirementObj);
      }
      currentSection = null;
    } else if (currentRequirementObj) {
      if (line.includes('- Mikro')) currentRequirementObj.business_scale.push('Mikro');
      if (line.includes('- Kecil')) currentRequirementObj.business_scale.push('Kecil');
      if (line.includes('- Menengah')) currentRequirementObj.business_scale.push('Menengah');
      if (line.includes('- Besar')) currentRequirementObj.business_scale.push('Besar');

      if (line.includes('risk_code:')) {
        const m = line.match(/risk_code:\s*"([^"]+)"/);
        if (m) currentRequirementObj.risk_code = m[1];
      }
      if (line.includes('risk_level:')) {
        const m = line.match(/risk_level:\s*"([^"]+)"/);
        if (m) currentRequirementObj.risk_level = m[1];
      }
      if (line.includes('processing_time:')) {
        const m = line.match(/processing_time:\s*"([^"]+)"/);
        if (m) currentRequirementObj.processing_time = m[1];
      }
      if (line.includes('authority:')) {
        const m = line.match(/authority:\s*"([^"]+)"/);
        if (m && !currentRequirementObj.authority) currentRequirementObj.authority = m[1];
      }
      if (line.includes('requirements:')) {
        currentSection = 'requirements';
      } else if (line.includes('obligations:')) {
        currentSection = 'obligations';
      } else if (line.includes('parameters:')) {
        currentSection = 'parameters';
      } else if (line.includes('authority_levels:')) {
        currentSection = 'authority_levels';
      }

      if (line.includes('- "NIB')) {
        const m = line.match(/- "([^"]+)"/);
        if (m && !currentRequirementObj.perizinan_usaha.includes(m[1])) {
          currentRequirementObj.perizinan_usaha.push(m[1]);
        }
      }

      if (line.includes('requirement:') || line.includes('text:')) {
        const m = line.match(/(?:requirement|text):\s*"([^"]+)"/);
        if (m && m[1] && !m[1].startsWith('Menyampaikan permohonan')) {
          if (currentSection === 'requirements') {
            currentRequirementObj.requirements.push(m[1]);
          } else if (currentSection === 'obligations') {
            currentRequirementObj.obligations.push(m[1]);
          }
        }
      }

      if (line.includes('obligation:')) {
        const m = line.match(/obligation:\s*"([^"]+)"/);
        if (m && m[1]) {
          currentRequirementObj.obligations.push(m[1]);
        }
      }

      // Check requirements listed directly under list: - "..."
      if (currentSection === 'requirements' && (trimmed.startsWith('- "') || trimmed.startsWith('-"'))) {
        const m = trimmed.match(/^-\s*"([^"]+)"/);
        if (m && m[1] && !m[1].startsWith('Menyampaikan permohonan') && !currentRequirementObj.requirements.includes(m[1])) {
          currentRequirementObj.requirements.push(m[1]);
        }
      }

      // Parameters
      if ((currentSection === 'parameters' || currentSection === 'authority_levels') && (trimmed.startsWith('- "') || trimmed.startsWith('-"'))) {
        const m = trimmed.match(/^-\s*"([^"]+)"/);
        if (m && m[1] && !currentRequirementObj.parameters.includes(m[1])) {
          currentRequirementObj.parameters.push(m[1]);
        }
      }
    }
  }

  // Fallback title
  if (!result.title && result.scopes.length > 0 && result.scopes[0].title) {
    result.title = result.scopes[0].title;
  }

  // Default values
  let riskLevel = 'Menengah Rendah';
  let riskCode = 'MR';
  let authority = 'Gubernur';
  let processingTime = 'Otomatis';
  let perizinanUsaha = 'NIB dan Sertifikat Standar';

  if (result.scopes[0] && result.scopes[0].licensing_requirements[0]) {
    const firstReq = result.scopes[0].licensing_requirements[0];
    riskLevel = firstReq.risk_level || riskLevel;
    riskCode = firstReq.risk_code || riskCode;
    authority = firstReq.authority || authority;
    processingTime = firstReq.processing_time || processingTime;
    if (firstReq.perizinan_usaha.length > 0) {
      perizinanUsaha = firstReq.perizinan_usaha.join(', ');
    }
  }

  return {
    kbli_code: result.kbli_code,
    title: result.title || ('Kegiatan Usaha ' + result.kbli_code),
    risk_code: riskCode,
    risk_level: riskLevel,
    authority: authority,
    processing_time: processingTime,
    perizinan_usaha: perizinanUsaha,
    scopes: result.scopes
  };
}

try {
  const filesA = fs.existsSync(dirKbli)
    ? fs.readdirSync(dirKbli).filter(f => f.endsWith('.yaml')).map(f => path.join(dirKbli, f))
    : [];
  const filesB = fs.existsSync(dirKbliB)
    ? fs.readdirSync(dirKbliB).filter(f => f.endsWith('.yaml')).map(f => path.join(dirKbliB, f))
    : [];

  const allFiles = [...filesA, ...filesB];
  console.log(`Found ${filesA.length} files in docs/kbli, and ${filesB.length} files in docs/kbli-b. Total: ${allFiles.length}`);

  const catalogMap = new Map();

  for (const file of allFiles) {
    const item = parseKbliFile(file);
    if (item.kbli_code) {
      catalogMap.set(item.kbli_code, item);
    }
  }

  const catalog = Array.from(catalogMap.values());
  catalog.sort((a, b) => a.kbli_code.localeCompare(b.kbli_code));

  console.log(`Compiled ${catalog.length} unique KBLI records.`);

  // Write to portal data
  fs.mkdirSync(path.dirname(targetPortalCatalog), { recursive: true });
  fs.writeFileSync(targetPortalCatalog, JSON.stringify(catalog, null, 2), 'utf8');
  console.log(`Wrote portal catalog to ${targetPortalCatalog}`);

  // Write to as-is app if exists
  if (fs.existsSync(path.dirname(targetAsIsCatalog))) {
    fs.writeFileSync(targetAsIsCatalog, JSON.stringify(catalog, null, 2), 'utf8');
    console.log(`Wrote as-is catalog to ${targetAsIsCatalog}`);
  }

  console.log('KBLI catalog build complete!');
} catch (err) {
  console.error('Failed to build KBLI catalog:', err);
  process.exit(1);
}

