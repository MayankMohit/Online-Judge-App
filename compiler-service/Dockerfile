FROM node:20-alpine
WORKDIR /app
RUN apk update && apk add --no-cache \
  build-base \
  gcc \
  g++ \
  make \
  libc6-compat \
  python3 \
  py3-pip \
  openjdk21
# Go + Rust toolchains are intentionally omitted to keep the image small on the
# 1GB-RAM host. To re-enable: add `go rust` above and restore the Go env vars
# (CGO_ENABLED=0, GOCACHE=/tmp/go-build, GOPATH=/tmp/go). The language registry
# entries for go/rust already exist; only the toolchain + UI toggle are gated.

ENV JAVA_HOME=/usr/lib/jvm/java-21-openjdk

# Unprivileged user that SUBMITTED code executes as. The Node server stays root so
# it can manage temp files and drop privileges per-run (the isolate model: root
# supervisor, unprivileged execution). SANDBOX_UID/GID tell sandbox.js to setuid
# the child; unset in local dev (Windows), so dev runs without dropping privileges.
RUN addgroup -g 1001 runner && adduser -D -u 1001 -G runner runner
ENV SANDBOX_UID=1001 \
    SANDBOX_GID=1001

# Precompile <bits/stdc++.h> into a PCH so C++ compiles don't re-parse the giant
# header every time. Flags MUST match the judge's compile flags (-O2 -std=c++17)
# or g++ silently ignores the PCH. g++ auto-uses stdc++.h.gch when present next
# to stdc++.h. Guarded so a missing header never fails the image build.
RUN STDCPP=$(find /usr/include -name 'stdc++.h' 2>/dev/null | head -n1); \
  if [ -n "$STDCPP" ]; then \
    g++ -O2 -std=c++17 -x c++-header "$STDCPP" -o "$STDCPP.gch" \
      && echo "Precompiled header built: $STDCPP.gch"; \
  else \
    echo "bits/stdc++.h not found; skipping PCH (compiles will be slower)"; \
  fi

COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5001
CMD ["node", "index.js"]
