"""Inspect actual browser-produced PDFs, independently of the browser DOM.

Usage: python tests/check-pdfs.py qa-artifacts (requires pypdf for QA only).
"""
import json
from pathlib import Path
import sys
import unicodedata
from pypdf import PdfReader

base = Path(sys.argv[1] if len(sys.argv) > 1 else 'qa-artifacts')
results = []
expected = ['quotation-ja.pdf', 'quotation-zh.pdf', 'quotation-en.pdf',
            'privacy-proof.pdf', 'invalid-quote.pdf', 'quotation-50-lines.pdf']
for name in expected:
    reader = PdfReader(base / name)
    text = unicodedata.normalize('NFKC', '\n'.join(page.extract_text() or '' for page in reader.pages))
    for forbidden in ['仕入', '粗利', '总成本', '单位成本', '毛利', 'Total cost', 'Unit cost', 'Gross profit', 'Gross margin']:
        assert forbidden not in text, (name, forbidden)
    if name == 'privacy-proof.pdf':
        assert '1,234,567' not in text and '6,419,754' not in text
        assert '7,654,321' in text
    elif name == 'invalid-quote.pdf':
        assert '7,654,321' not in text and '1,234,567' not in text
        assert 'Check fee descriptions' in text
    elif name == 'quotation-50-lines.pdf':
        for index in range(1, 51):
            assert f'Line {index}:' in text, f'Missing row {index}'
        assert '600' in text
    else:
        currency = {'quotation-ja.pdf': 'JPY', 'quotation-zh.pdf': 'CNY', 'quotation-en.pdf': 'USD'}[name]
        assert currency in text, (name, 'Missing ISO currency code')
        assert len(reader.pages) == 1
    results.append({'file': name, 'pages': len(reader.pages), 'status': 'PASS'})
(base / 'pdf-results.json').write_text(json.dumps(results, indent=2), encoding='utf-8')
print(json.dumps(results, indent=2))
