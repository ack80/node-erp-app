## Comandos

### Docker:

```
docker run --rm zaproxy/zap-stable zap-baseline.py -h

docker run -v $(pwd):/zap/wrk owasp/zap2docker-stable zap-baseline.py -t https://tu-staging.com -c test/security/zap-baseline.conf

docker run --rm -v $(pwd)/test/security:/zap/wrk/:rw \
  zaproxy/zap-stable zap-baseline.py \
  -t https://tu-staging-url.com \
  -c zap-baseline.conf
```

### Notas:
```
k6 y OWASP casi nunca corren en cada PR — son pesados y necesitan un ambiente vivo (staging), así que van en jobs separados, programados o disparados a mano.```