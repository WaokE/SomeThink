# 시연 사이트

[SOMETHINK](https://somethink.online, "site link")

# SOMETHINK 💡

<img src="/client/src/img/icon/logo.png">

# 목차 📜

- [프로젝트 소개](#프로젝트-소개-)
- [개발 기간](#개발-기간-)
- [기능](#기능-)
- [사용한 기술 스택](#기술-)
- [팀 멤버](#팀-멤버-)
- [포스터](#포스터-)
- [시연 영상](#시연-영상-)

# 프로젝트 소개 🖐️

> 아무리 생각해봐도 떠오르지 않는 아이디어, 지긋지긋한 회의들들.. 누구나 아이디어를 떠올리려 할 때면 한 번쯤 겪어봤을 문제들입니다. 이와 같은 문제를 해결하기 위해, 빠른 아이디어 회의를 위한 마인드맵 기반 협업 툴, SOMETHINK를 기획하게 되었습니다!

# 개발 기간 🗓️

## 2023년 7월 7일 ~ 2023년 8월 10일

# 기능 ⭐

## 팀원들과 함께 만들어 나가는 마인드 맵 🗺️

혼자, 혹은 팀원들과 함께 마인드맵을 확장해 나가며 아이디어 회의를 진행할 수 있습니다.

## 실시간으로 동기화되는 객체들

- 객체 이동, 삭제, 생성 등 모든 작업을 참여한 인원들과 실시간으로 동기화하여 화면에 보여줍니다.

![객체 동기화](https://github.com/JeongHanO/SomeThink/assets/128684924/9e4aca0f-fa46-4686-8f31-47e43b9aa669)

- 참여한 유저들의 캔버스 상의 마우스 위치를 지속적으로 트래킹하여 화면에 보여줍니다.

![마우스 트래킹](https://github.com/JeongHanO/SomeThink/assets/128684924/55bb244c-c30f-4c1c-8c8e-8dd761d66260)
 
- 참여한 유저가 현재 클릭한 노드를 하이라이트하여 보여줍니다.

![객체 하이라이트](https://github.com/JeongHanO/SomeThink/assets/128684924/f3dd67d3-e895-476e-ae29-3a52127baaab)


## 회의를 도와줄 기능들

- AI 노드 추천 : AI가 선택한 노드의 상위 노드들과의 상하관계, 형제 노드들과의 연관관계를 분석하여 자식 노드를 추천해줍니다.

  ![AI추천](https://github.com/JeongHanO/SomeThink/assets/128684924/643f8ffc-ae90-4053-822f-37e5f9788b90)

- 노드 북마크 : 노드 북마크를 통해 원하는 노드에 북마크를 추가하고, 바로가기에서 쉽게 식별할 수 있습니다.

  ![북마크 노드](https://github.com/JeongHanO/SomeThink/assets/128684924/1481614d-5400-40f1-9303-da6e4aa58c19)

- 이미지 추가 : 원하는 키워드를 통해 이미지를 검색하여 불러오거나, 이미지 URL을 직접 입력하여 이미지 노드를 추가할 수 있습니다. 또한 이미지 노드는 선택 후 마우스 휠을 통해 크기를 조정할 수 있습니다.

  ![이미지 노드](https://github.com/JeongHanO/SomeThink/assets/128684924/884291fa-8121-4527-ba7f-26e444e08cd8)

- 공유 타이머, 메모 : 실시간으로 세션에 접속한 인원 모두에게 동기화되는 공유 타이머와, 메모장이 있습니다.

  ![타이머, 메모 동기화](https://github.com/JeongHanO/SomeThink/assets/128684924/2555d70c-386e-4339-a431-754141342cff)

- 음성 통화 : 세션에 참가한 인원들과 음성 통화가 가능하며, 원한다면 본인의 마이크를 음소거 하는 것도 가능합니다.

## 유저의 편의를 위한 기능들

- 노드 바로가기 : 바로가기 탭을 통해 노드들의 상하관계를 쉽게 파악하고, 해당 노드를 클릭하여 캔버스상의 노드 위치로 편하게 포커스를 옮길 수 있습니다.

  ![노드 바로가기](https://github.com/JeongHanO/SomeThink/assets/128684924/49745caa-3bf8-4265-adfe-ad4bad4851cf)

- 실행 취소, 다시 실행 : 유저가 작업했던 내용을 기억하여, 실행 취소, 다시 실행 (Ctrl+Z, Shift+Ctrl+Z)를 지원합니다.

  ![되돌리기](https://github.com/JeongHanO/SomeThink/assets/128684924/a4f46bba-e63a-4948-867a-626f2277a5d5)

- 마인드맵 화면 캡처 : html2canvas를 이용한 마인드맵 화면 캡처를 지원합니다.

  ![캡처](https://github.com/JeongHanO/SomeThink/assets/128684924/4747ca40-9a00-4b50-9399-292a8fe46be5)

- 마인드맵 스냅샷 내보내기 : 마인드맵의 데이터를 파싱하여, 텍스트 형태로 저장하고, 원하는 때에 불러와 작업을 이어갈 수 있습니다.

  ![스냅샷](https://github.com/JeongHanO/SomeThink/assets/128684924/9bef5edd-ad0b-486a-911d-e4b725b5e9a8)

# 사용한 기술 스택 🔧

- FE: React
- BE: Node.js(express), Docker

# 아키텍쳐 🔧

![찐키텍처](https://github.com/JeongHanO/SomeThink/assets/128684924/88333d72-dab7-4274-95a7-97758c456298)

# 팀 멤버 👥

**오정한 김희령 심우근 박도형 이형준**

# 포스터 🖼️

![썸띵크 300dpi-min](https://github.com/JeongHanO/SomeThink/assets/128684924/4f9f5e60-eea2-4253-aade-910ed25b6798)


# 시연 영상 📹
[시연 영상 보러가기!](https://www.youtube.com/watch?v=zox5UzbiDvk&ab_channel=jaedupkim, "video link")
