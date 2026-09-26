# python3 p3/prune-css.py <styles.css> <dist dir> <out.css>: drops the CSS rules
# that no built page or script can match (a selector naming a class or id that
# appears in no page and no script token), unused @keyframes, and the comments
# that only described removed rules; section headers stay while their section
# has rules. Prints what it did. Prove the result with p3/cssdiff.mjs before
# using it: every element on every page must compute the same style.
import re, sys, os, glob
src, dist, out = sys.argv[1], sys.argv[2], sys.argv[3]
css = open(src).read()
used = set()
ids = set()
for f in glob.glob(os.path.join(dist, '**', '*.html'), recursive=True):
    h = open(f, encoding='utf8').read()
    for m in re.finditer(r'class="([^"]*)"', h): used.update(m.group(1).split())
    for m in re.finditer(r"class='([^']*)'", h): used.update(m.group(1).split())
    for sc in re.findall(r'<script[^>]*>([\s\S]*?)</script>', h): used.update(re.findall(r'[A-Za-z_][\w-]*', sc))
    for m in re.finditer(r'\bid="([^"]*)"', h): ids.add(m.group(1))
for f in glob.glob(os.path.join(dist, 'js', '**', '*.js'), recursive=True) + glob.glob(os.path.join(dist, 'vendor', '*.js')):
    toks = re.findall(r'[A-Za-z_][\w-]*', open(f, encoding='utf8').read()); used.update(toks); ids.update(toks)

def dead_sel(sel):
    classes = re.findall(r'\.([A-Za-z_][\w-]*)', re.sub(r':not\([^)]*\)', '', re.sub(r'\[[^\]]*\]', '', sel)))
    bare = re.sub(r':not\([^)]*\)', '', re.sub(r'\[[^\]]*\]', '', sel))
    idl = re.findall(r'#([A-Za-z_][\w-]*)', bare)
    return any(c not in used for c in classes) or any(i not in ids for i in idl)

HDR = r'/\*\s*(?:-{3,}|={3,})(?:(?!\*/)[\s\S])*\*/'
removed = []
handed = []  # a removed rule's comment dropped right above a kept rule with none of its own: listed for review
def split_lead(head):
    # (text before the attached comment, the attached comment, selector text)
    if '*/' not in head: return '', '', head
    e = head.rfind('*/') + 2
    sel = head[e:]
    s = head.rfind('/*', 0, e)
    return head[:s], head[s:e], sel

def prune_block(text):
    res, i, n = [], 0, len(text)
    pending = ''  # the comment of the last removed rule, for the review list
    while i < n:
        j = text.find('{', i)
        if j < 0: res.append(text[i:]); break
        head = text[i:j]
        depth, k = 1, j + 1
        while depth and k < n:
            if text[k] == '{': depth += 1
            elif text[k] == '}': depth -= 1
            k += 1
        body = text[j + 1:k - 1]
        before, cmt, sel = split_lead(head)
        s = sel.strip()
        keep_text = None
        if s.startswith('@'):
            if s.startswith('@media') or s.startswith('@supports'):
                inner = prune_block(body)
                if re.search(r'\{', inner): keep_text = sel + '{' + inner + '}'
            else:
                keep_text = sel + '{' + body + '}'
        else:
            parts = s.split(',')
            keep = [p for p in parts if not dead_sel(p)]
            if keep:
                keep_text = sel if len(keep) == len(parts) else sel[:len(sel) - len(sel.lstrip())] + ','.join(keep).strip() + ' '
                keep_text += '{' + body + '}'
        if keep_text is None:
            removed.append(s[:90])
            if cmt and re.match(HDR, cmt): res.append(before + cmt + '\n')
            else:
                res.append(before)
                if cmt: pending = cmt
        else:
            if not cmt and pending and not before.strip():
                handed.append((pending[:160], s[:60]))
            res.append(before + cmt + keep_text)
            pending = ''
        i = k
    return ''.join(res)

new = prune_block(css)
# section headers left with nothing under them: a header followed directly by another header or the end
for _ in range(3):
    new = re.sub(r'(' + HDR + r')(\s*)(?=' + HDR + r'|\s*$)', '', new)
js_all = ' '.join(open(f, encoding='utf8').read() for f in glob.glob(os.path.join(dist, 'js', '**', '*.js'), recursive=True))
while True:
    names = re.findall(r'@keyframes\s+([\w-]+)', new)
    dead = [k for k in names if not re.search(r'animation(?:-name)?\s*:[^;}]*\b' + re.escape(k) + r'\b', new) and k not in js_all]
    if not dead: break
    for k in dead:
        m = re.search(r'(/\*(?:(?!\*/)[\s\S])*\*/\s*)?@keyframes\s+' + re.escape(k) + r'\s*\{', new)
        st = m.start(); d, q = 1, m.end()
        while d: d += {'{': 1, '}': -1}.get(new[q], 0); q += 1
        cm = m.group(1) or ''
        keep_cm = cm if re.match(HDR, cm.strip()) else ''
        removed.append('@keyframes ' + k); new = new[:st] + keep_cm + new[q:]
for _ in range(3):
    new = re.sub(r'(' + HDR + r')(\s*)(?=' + HDR + r'|\s*$)', '', new)
new = re.sub(r'\n{3,}', '\n\n', new)
open(out, 'w').write(new)
[print('RM', r) for r in removed if r.startswith('@keyframes') or '#' in r]
print(len(removed), 'rules removed;', len(css), '->', len(new), 'bytes')
for c, r in handed: print('DROPPED ABOVE', r, '::', c.replace(chr(10), ' '))
