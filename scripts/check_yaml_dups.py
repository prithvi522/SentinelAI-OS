from pathlib import Path
p=Path('E:/oprating system/docker-compose.yml')
text=p.read_text(encoding='utf-8')
lines=text.splitlines()
stack=[(-1, set())] # (indent, keys)
errors=[]
for i,line in enumerate(lines, start=1):
    stripped=line.lstrip()
    if not stripped or stripped.startswith('#'):
        continue
    indent=len(line)-len(stripped)
    if ':' in stripped:
        key = stripped.split(':',1)[0].strip()
        while stack and indent<=stack[-1][0]:
            stack.pop()
        if not stack:
            stack=[(-1,set())]
        keys=stack[-1][1]
        if key in keys:
            errors.append((i,key))
        else:
            keys.add(key)
        stack.append((indent, set()))
if errors:
    for ln,k in errors:
        print(f"Duplicate key '{k}' at line {ln}")
else:
    print('No duplicates found')
