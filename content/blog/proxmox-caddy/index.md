---
title: 홈서버 2. Proxmox의 Ubuntu VM에 Caddy로 리버스 프록시 서버 만들기
date: '2025-07-19T10:00:00.000Z'
description: Proxmox에서 생성한 Ubuntu VM에 Caddy를 Docker Compose로 설치하고, Caddyfile을 구성해 리버스 프록시 설정까지 진행하는 방법을 설명합니다.
---

이번 글에서는 Proxmox에서 생성한 Ubuntu 24.04 LTS VM 환경에 [Caddy](https://caddyserver.com/)를 설치하고, Docker Compose를 이용해 리버스 프록시 서버를 구성하는 방법을 소개합니다.

Caddy는 HTTPS 설정이 자동으로 적용되며, 직관적인 설정 파일인 Caddyfile을 통해 손쉽게 리버스 프록시나 정적 서버를 구성할 수 있습니다. 이 글에서는 Docker 설치부터 Caddy 컨테이너 실행, 그리고 실제 서비스를 위한 Caddyfile 작성까지 전 과정을 단계별로 정리했습니다.

## Docker 및 Docker Compose 설치

Ubuntu에 Docker를 설치하는 가장 간단한 방법은 Docker에서 제공하는 공식 설치 스크립트를 사용하는 것입니다.

```bash
curl -sSL https://get.docker.com | sh
```

설치가 완료되면, 다음 명령어로 Docker와 Docker Compose가 정상적으로 설치되었는지 확인할 수 있습니다.

```bash
docker -v
docker compose version
```

아래와 같은 출력이 나타나면 정상적으로 설치된 것입니다.

```bash
Docker version 28.3.1, build 38b7060
Docker Compose version v2.38.1
```

출력되는 버전 번호는 환경에 따라 다를 수 있지만, 버전 정보가 표시되면 설치는 정상적으로 완료된 것입니다.

Docker 명령어를 `sudo` 없이 실행할 수 있도록, 현재 사용자를 Docker 그룹에 추가합니다.
아래 명령어를 실행한 후에는 변경 사항이 적용되도록 반드시 재로그인해야 합니다.

SSH 환경이라면 `exit` 명령으로 세션을 종료한 뒤, 다시 접속하세요. 예를 들어, 사용자명이 `ubuntu-user`인 경우 다음과 같이 입력합니다.

```bash
sudo usermod -aG docker ubuntu-user
```

## Caddy 설치 디렉터리 구성

Caddy 설정과 정적 파일을 관리할 디렉터리를 구성합니다.

```bash
mkdir -p ~/caddy/{conf,site}
```

- `/caddy/conf`: Caddyfile을 저장하는 위치입니다.
- `/caddy/site`: 정적 파일(HTML, 이미지 등)을 저장하는 공간입니다.

## docker-compose.yml 작성

이제 `/caddy` 디렉터리로 이동하여 `docker-compose.yml` 파일을 생성합니다.

```bash
cd ~/caddy
vi docker-compose.yml
```

```yaml
services:
  caddy:
    image: caddy:2.10.0
    container_name: caddy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
      - "443:443/udp"
    volumes:
      - ./conf:/etc/caddy
      - ./site:/srv
      - caddy_data:/data
      - caddy_config:/config

volumes:
  caddy_data:
  caddy_config:
```

제가 설치할 당시에는 2.10.0이 최신 버전이었지만, 최신 버전은 [Caddy GitHub Releases](https://github.com/caddyserver/caddy/releases)에서 확인하실 수 있습니다. 특정 버전이 필요한 경우, 해당 태그로 이미지 버전을 지정해 사용하시면 됩니다.

## Caddyfile 작성

Caddyfile은 Caddy의 핵심 설정 파일입니다. 리버스 프록시를 비롯한 다양한 기능을 이 파일에서 정의할 수 있습니다.

```bash
cd /caddy/conf
vi Caddyfile
```

가장 기본적인 리버스 프록시 예시는 다음과 같습니다.
예를 들어, 로컬에서 실행 중인 애플리케이션을 리버스 프록시하려면 다음과 같이 작성할 수 있습니다.

```caddyfile
example.com {
    reverse_proxy localhost:9005
}
```

또는 내부 네트워크(Proxmox 내 다른 VM 등)에 있는 서버를 리버스 프록시하려면 다음과 같이 사용할 수 있습니다.

```caddyfile
wireguard.example.com {
    reverse_proxy 192.168.0.120:51821
}
```

이 예시에서 192.168.0.120은 Proxmox 환경에 생성한 다른 VM의 IP입니다.
일반적인 가정용 공유기 환경에서는 VM마다 192.168.x.x 형태의 내부 IP가 자동으로 할당됩니다.
Caddy가 설치된 VM에서 해당 IP로 접근할 수 있다면 정상적으로 리버스 프록시가 동작합니다.

> 더 다양한 예시는 [공식 문서](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy#examples)에서 확인이 가능합니다.

## 실행 및 확인

Docker Compose로 Caddy를 실행합니다.

```bash
cd /caddy
docker compose up -d
```

정상적으로 실행되었는지 확인하려면 다음 명령어를 사용할 수 있습니다.

```bash
docker ps -a
docker logs caddy
```

웹 브라우저에서 도메인 또는 서버 IP로 접속해 리버스 프록시가 잘 작동하는지 확인해 보세요.

만약 외부 네트워크(인터넷)에서 접속하려는 경우, 공유기의 포트포워딩 설정이 필요합니다.
일반적으로는 80번(HTTP)과 443번(HTTPS) 포트를 Caddy가 설치된 내부 IP(예: 192.168.x.x)로 포워딩하면 됩니다.

이렇게 설정하면 외부에서 example.com 도메인으로 접속했을 때, 내부에서 동작 중인 Caddy가 외부 요청을 처리할 수 있게 됩니다.

만약 포트포워딩이 어려운 환경이라면 Cloudflare Tunnel과 같은 서비스를 활용하여 외부에서 도메인으로 안전하게 접속할 수 있는 구조를 구성할 수도 있습니다.

## 마치며

Caddy는 HTTPS 자동 발급, 직관적인 설정, 그리고 가벼운 컨테이너 구성을 통해 홈서버나 셀프호스팅 프로젝트에 매우 적합한 웹서버입니다.

이 글에서는 Docker Compose를 사용해 Ubuntu 환경에서 Caddy를 구성하고, Caddyfile을 통해 간단한 리버스 프록시 설정을 적용하는 과정을 정리했습니다.

정적 파일을 제공하거나 다양한 서비스를 리버스 프록시로 연결하고자 할 때, Caddy는 간편하면서도 강력한 대안이 될 수 있습니다.

앞으로 여러 서비스를 셀프호스팅할 계획이라면, Caddy를 기반으로 구성해 보는 것을 추천드립니다.

### Reference

https://caddyserver.com/docs/
