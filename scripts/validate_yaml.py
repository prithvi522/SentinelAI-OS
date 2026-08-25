import yaml
p='E:/oprating system/docker-compose.yml'
with open(p,'r',encoding='utf-8') as f:
    try:
        yaml.safe_load(f)
        print('YAML parsed OK')
    except Exception as e:
        print('YAML parse error:',e)
