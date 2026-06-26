# Warm Paper Diary (5diary)

물리 5년/10년 일기장을 디지털로 옮긴 **사진 일기 PWA**. 시간을 2축으로 본다.

- **가로 = 날짜(월·일)** — 한 "페이지" = 하나의 날짜. 연도에 종속되지 않는다.
- **세로 = 연도** — 한 페이지 안에 같은 날짜의 여러 해 기록이 세로로 쌓인다(최신 해 위).
- 좌우 스와이프 = 날짜 이동, 상하 스크롤 = 연도 카드 스크롤.

## 기술 스택

- React + TypeScript + Vite
- 라우팅: `react-router-dom` (HashRouter)
- 저장소: IndexedDB (`idb`) — 사진은 IndexedDB에만 저장
- PWA: `vite-plugin-pwa` (오프라인 우선)
- 스와이프: `react-swipeable`
- 배포: GitHub Pages (`base: '/5diary/'`)

## 개발

```bash
npm install
npm run dev      # 개발 서버
npm run build    # 타입체크 + 프로덕션 빌드
npm run preview  # 빌드 결과 미리보기
```

PWA 아이콘은 빌드 의존성 없이 Node 내장 모듈로 생성합니다:

```bash
node scripts/gen-icons.mjs
```

## 배포

`main` 브랜치에 push하면 `.github/workflows/deploy.yml`이 빌드 후 GitHub Pages로
배포합니다. 저장소 Settings → Pages → Source를 **GitHub Actions**로 설정하세요.

수동 배포(`gh-pages` 브랜치)도 가능합니다:

```bash
npm run deploy
```

## 화면

| 경로 | 화면 |
|---|---|
| `/` | 날짜 페이지(타임라인) — 연도 카드 세로 리스트, 좌우 스와이프 |
| `/edit/:mmdd/:year` | 작성/편집 — 사진 추가/삭제/정렬, 본문 |
| `/photo/:entryId/:index` | 사진 확대 — contain-fit, 도트, 스와이프 |
| `/calendar` | 기록 달력 — 월 그리드, 기록 표시 |
| `/settings` | 설정 — 표시 연수, JSON 내보내기/가져오기 |

## 데이터 백업

설정 → 백업에서 모든 기록과 사진을 **단일 JSON**으로 내보내고 가져올 수 있습니다.
사진은 base64 dataURL로 동봉됩니다. (사진이 많으면 파일이 커집니다 — 추후 ZIP 백업
업그레이드 경로를 `src/lib/backup.ts` 주석에 남겨 두었습니다.)
