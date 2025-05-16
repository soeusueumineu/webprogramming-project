

// set_model.js에서 초기화 함수(init), 렌더러, 애니메이션 ID 가져오기
import { init, renderer, animateId } from "./set_model.js";

document.addEventListener("DOMContentLoaded", () => {
  // 주요 DOM 요소 선택
  const toggleBtn = document.getElementById("menuToggle"); // 메뉴 열기 버튼
  const closeBtn = document.getElementById("closeMenu"); // 메뉴 닫기 버튼
  const menu = document.getElementById("playlistMenu"); // 메뉴 전체 영역
  const mainWrapper = document.getElementById("mainWrapper"); // 메인 콘텐츠 wrapper
  const overlay = document.getElementById("loading-overlay"); // 3D 로딩 오버레이
  const darkToggle = document.getElementById("darkToggleFloating"); // 다크모드 버튼
  const volumeToggle = document.getElementById("volumeToggle"); // 볼륨 조절 버튼
  const volumeFloating = document.getElementById("volumeFloating"); // 볼륨 조절 창
  const audioPlayer = document.getElementById("audioPlayer"); // 음악 재생 오디오
  const volumeControl = document.getElementById("volumeControl"); // 볼륨 슬라이더
  const allDetails = document.querySelectorAll("#playlistMenu details"); // 카테고리별 접기/펼치기 요소
  const volumeValue = document.getElementById("volumeValue"); // 볼륨 퍼센트 텍스트
  const cards = document.querySelectorAll(".card"); // 분위기 카드들
  const threeContainer = document.getElementById("threeContainer"); // 3D 씬 컨테이너
  const exit3D = document.getElementById("exit3D"); // 3D 환경 나가기 버튼
  const stopMusicButtonInVolume = document.getElementById(
    "stopMusicButtonInVolume"
  ); // 음악 정지 버튼

  // 배경음으로 사용하는 오디오 객체
  let campfireAudio = null;

  // 🎵 메뉴 열기
  toggleBtn.addEventListener("click", () => {
    menu.classList.add("open");
    mainWrapper.classList.add("shifted");
  });

  // ❌ 메뉴 닫기
  closeBtn.addEventListener("click", () => {
    menu.classList.remove("open");
    mainWrapper.classList.remove("shifted");
    allDetails.forEach((detail) => (detail.open = false)); // 모두 닫음
  });

  // 🌙 다크 모드 토글
  darkToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    darkToggle.textContent = document.body.classList.contains("dark-mode")
      ? "☀️"
      : "🌙";
  });

  // 🔊 볼륨 컨트롤 열기/닫기
  volumeToggle.addEventListener("click", () => {
    volumeFloating.style.display =
      volumeFloating.style.display === "block" ? "none" : "block";
  });

  // ▶️ 음악 재생 (일반 음악용)
  function playMusic(filename) {
    stopAllSounds(); // 기존 배경음 멈추고
    audioPlayer.src = filename;
    audioPlayer.volume = volumeControl.value;
    audioPlayer.play();
  }

  // 🛑 음악 정지 버튼 기능
  stopMusicButtonInVolume.addEventListener("click", () => {
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
    stopAllSounds();
  });

  // 전역에서 호출 가능하게 등록
  window.playMusic = playMusic;

  // 🎚️ 볼륨 변경 시 반영
  volumeControl.addEventListener("input", () => {
    const volume = volumeControl.value;
    audioPlayer.volume = volume;
    if (campfireAudio) campfireAudio.volume = volume;
    volumeValue.textContent = `${Math.round(volume * 100)}%`;
  });

  // details 하나만 열리도록 처리
  allDetails.forEach((detail) => {
    detail.addEventListener("toggle", () => {
      if (detail.open) {
        allDetails.forEach((other) => {
          if (other !== detail) other.open = false;
        });
      }
    });
  });

  // 🧩 카드 클릭 시 3D 환경 로딩 및 배경음 재생
  cards.forEach((card) => {
    card.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      const cardText = card.querySelector(".card-front").textContent.trim();
      let glbPath = "";

      // 기존 음악 정지
      audioPlayer.pause();
      audioPlayer.currentTime = 0;
      stopAllSounds();

      // 카드 이름에 따라 모델 경로 및 사운드 설정
      switch (cardText) {
        case "🔥 모닥불 감성":
          glbPath =
            "https://poom-eo.s3.ap-northeast-2.amazonaws.com/environment/models/campfire.glb";
          playCampfireSound();
          break;
        case "🌧️ 비 오는 날":
          glbPath =
            "https://poom-eo.s3.ap-northeast-2.amazonaws.com/environment/models/rainy.glb";
          playRainSound();
          break;
        case "🌙 밤 감성":
          glbPath = "environment/models/night.glb";
          playNightSound();
          break;
        case "🌌 몽환적인 분위기":
          glbPath =
            "https://poom-eo.s3.ap-northeast-2.amazonaws.com/environment/models/dreamy.glb";
          playDreamySound();
          break;
        default:
          glbPath = "environment/models/default.glb";
      }
      cards.forEach((c) => (c.style.pointerEvents = "none"));

      overlay.style.display = "block";
      init(glbPath, cardText); // 3D 씬 초기화
    });
  });

  // 🔥 모닥불 소리 재생
  function playCampfireSound() {
    stopAllSounds();
    campfireAudio = new Audio(
      "https://poom-eo.s3.ap-northeast-2.amazonaws.com/environment/music/card/fire.mp3"
    );
    campfireAudio.loop = true;
    campfireAudio.volume = volumeControl.value;
    campfireAudio.play();
  }

  // 🌧️ 비 오는 날 소리 재생
  function playRainSound() {
    stopAllSounds();
    campfireAudio = new Audio(
      "https://poom-eo.s3.ap-northeast-2.amazonaws.com/environment/music/card/rain.mp3"
    );
    campfireAudio.loop = true;
    campfireAudio.volume = volumeControl.value;
    campfireAudio.play();
  }

  // 🌙 밤 감성 소리 재생
  function playNightSound() {
    stopAllSounds();
    campfireAudio = new Audio(
      "https://poom-eo.s3.ap-northeast-2.amazonaws.com/environment/music/card/night.mp3"
    );
    campfireAudio.loop = true;
    campfireAudio.volume = volumeControl.value;
    campfireAudio.play();
  }

  // 🌌 몽환적인 분위기 소리 재생
  function playDreamySound() {
    stopAllSounds();
    campfireAudio = new Audio(
      "https://poom-eo.s3.ap-northeast-2.amazonaws.com/environment/music/card/dreamy.mp3"
    );
    campfireAudio.loop = true;
    campfireAudio.volume = volumeControl.value;
    campfireAudio.play();
  }

  // 🔇 모든 배경 사운드 정지 함수
  function stopAllSounds() {
    if (campfireAudio) {
      campfireAudio.pause();
      campfireAudio.currentTime = 0;
      campfireAudio = null;
    }
  }

  // ❌ 3D 환경 종료 버튼 클릭 시 처리
  exit3D.addEventListener("click", () => {
    overlay.style.display = "none";
    overlay.style.opacity = 1;
    document.body.style.overflow = "auto";
    cancelAnimationFrame(animateId); // 애니메이션 중지
    threeContainer.style.display = "none";
    exit3D.style.display = "none";
    renderer.dispose(); // WebGL 리소스 해제
    renderer.forceContextLoss();
    threeContainer.innerHTML = ""; // 컨테이너 비우기
    stopAllSounds(); // 사운드도 정지
    cards.forEach((c) => (c.style.pointerEvents = "auto"));
  });

  // 페이지 클릭 시 볼륨 창 닫기 (외부 클릭 감지)
  document.addEventListener("click", (e) => {
    if (
      !volumeFloating.contains(e.target) &&
      !volumeToggle.contains(e.target)
    ) {
      volumeFloating.style.display = "none";
    }
  });
});
